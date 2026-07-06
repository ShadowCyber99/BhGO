const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

// 1. Remove the AI Simulator block in request_ride
const startStr = "    // AI SIMULATOR TRIGGER";
const endStr = "    registerSimTracker(rideId, 'timeout', matchTimeout);\n  });";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + "  });\n" + content.substring(endIndex);
}

// 2. Insert accept_ride and update_ride_status after request_ride
const insertStr = `
  // Driver explicitly accepts a ride
  socket.on('accept_ride', async (data) => {
    const { rideId, driverId } = data;
    try {
      console.log(\`✅ Driver \${driverId} accepting Ride \${rideId}\`);
      
      const rideRes = await db.query('SELECT * FROM rides WHERE id = $1', [rideId]);
      if (rideRes.rows.length === 0) return;
      const ride = rideRes.rows[0];

      if (ride.status !== 'requested') return; // Someone else got it or it was cancelled

      const driverRes = await db.query('SELECT d.*, u.name, u.rating FROM drivers d JOIN users u ON d.user_id = u.id WHERE d.user_id = $1', [driverId]);
      if (driverRes.rows.length === 0) return;
      const driver = driverRes.rows[0];

      // Update ride
      await db.query("UPDATE rides SET status = 'accepted', driver_id = $1 WHERE id = $2", [driverId, rideId]);
      // Update driver to unavailable
      await db.query("UPDATE drivers SET is_available = false WHERE user_id = $1", [driverId]);

      const updatedRide = {
        ...ride,
        status: 'accepted',
        driver_id: driverId,
        driverName: driver.name,
        driverRating: parseFloat(driver.rating),
        vehicleName: driver.vehicle_name,
        vehicleNumber: driver.vehicle_number,
        vehicleType: driver.vehicle_type,
        driverLat: parseFloat(driver.latitude),
        driverLng: parseFloat(driver.longitude)
      };

      // Notify passenger and driver
      io.to(\`user_\${ride.rider_id}\`).emit('ride_status_update', { ride: updatedRide });
      io.to(\`user_\${driverId}\`).emit('ride_status_update', { ride: updatedRide });
      io.emit('drivers_changed');

    } catch (err) {
      console.error('Accept Ride Error:', err.message);
    }
  });

  // Driver updates ride status
  socket.on('update_ride_status', async (data) => {
    const { rideId, status } = data;
    try {
      console.log(\`🔄 Ride \${rideId} status updated to \${status}\`);
      await db.query("UPDATE rides SET status = $1 WHERE id = $2 RETURNING *", [status, rideId]);
      
      const rideRes = await db.query('SELECT * FROM rides WHERE id = $1', [rideId]);
      if (rideRes.rows.length === 0) return;
      const ride = rideRes.rows[0];

      // If completed, free driver
      if (status === 'completed') {
        await db.query("UPDATE drivers SET is_available = true WHERE user_id = $1", [ride.driver_id]);
        io.emit('drivers_changed');
      }

      // Notify passenger and driver
      io.to(\`user_\${ride.rider_id}\`).emit('ride_status_update', { ride });
      io.to(\`user_\${ride.driver_id}\`).emit('ride_status_update', { ride });

    } catch (err) {
      console.error('Update Ride Status Error:', err.message);
    }
  });
`;

const requestRideEnd = "socket.broadcast.emit('new_ride_requested', rideData);\n  });";
const replaceIndex = content.indexOf(requestRideEnd);
if (replaceIndex !== -1) {
  content = content.substring(0, replaceIndex + requestRideEnd.length) + insertStr + content.substring(replaceIndex + requestRideEnd.length);
}

// 3. Remove simulateTripTimeline
const simStartStr = "// Trip simulation logic: moves the car marker along the paths";
const simEndStr = "  registerSimTracker(rideId, 'interval', pickupInterval);\n}\n";

const simStartIndex = content.indexOf(simStartStr);
const simEndIndex = content.indexOf(simEndStr) + simEndStr.length;

if (simStartIndex !== -1 && simEndIndex !== -1) {
  content = content.substring(0, simStartIndex) + content.substring(simEndIndex);
}

fs.writeFileSync('server.js', content, 'utf8');
console.log('Patched server.js successfully.');
