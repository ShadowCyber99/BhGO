const fs = require('fs');

const files = [
  './src/screens/DriverHomeScreen.js',
  './src/screens/HistoryScreen.js',
  './src/screens/RideActiveScreen.js',
  './src/screens/RiderHomeScreen.js',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Currency
    content = content.replace(/\$\\\$\{/g, '₹$${');
    content = content.replace(/Pay \$\$\{fare/g, 'Pay ₹${fare');
    content = content.replace(/\>\\\$/g, '>₹');
    content = content.replace(/\>\$/g, '>₹');
    content = content.replace(/\$\$\{incomingRequest\.fare\}/g, '₹${incomingRequest.fare}');
    content = content.replace(/\$\$\{activeRide\.fare\}/g, '₹${activeRide.fare}');
    content = content.replace(/\$\$\{item\.fare\?\.toFixed\(2\)\}/g, '₹${item.fare?.toFixed(2)}');
    content = content.replace(/\$\$\{selectedInvoice\.fare\?\.toFixed\(2\)\}/g, '₹${selectedInvoice.fare?.toFixed(2)}');
    content = content.replace(/\$\$\{ride\.fare\?\.toFixed\(2\)\}/g, '₹${ride.fare?.toFixed(2)}');
    content = content.replace(/\$\$\{item\.price\}/g, '₹${item.price}');
    content = content.replace(/\$\$\{c\.price\}/g, '₹${c.price}');
    content = content.replace(/\$\$\{cartTotal\.toFixed\(2\)\}/g, '₹${cartTotal.toFixed(2)}');
    content = content.replace(/\$5\.00/g, '₹50.00');
    content = content.replace(/\$\{\(cartTotal \+ 5\)\.toFixed\(2\)\}/g, '₹${(cartTotal + 50).toFixed(2)}');
    content = content.replace(/\$\$\{fare\.toFixed\(2\)\}/g, '₹${fare.toFixed(2)}');
    content = content.replace(/\$\$\{paymentAmount\.toFixed\(2\)\}/g, '₹${paymentAmount.toFixed(2)}');
    content = content.replace(/\$999\.00/g, '₹999.00');
    content = content.replace(/\$\$\{refundData\.fare\.toFixed\(2\)\}/g, '₹${refundData.fare.toFixed(2)}');
    
    // Also replace direct string values like ` - $` with ` - ₹`
    content = content.replace(/ - \$\$\{/g, ' - ₹${');

    // Hardcoded whites -> dynamic text
    content = content.replace(/color: '#FFF'/g, 'color: colors.text');
    content = content.replace(/color: '#FFFFFF'/g, 'color: colors.text');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
  } else {
    console.log('Not found', file);
  }
});
