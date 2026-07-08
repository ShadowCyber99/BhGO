import React from 'react';
import { Platform, Text, View } from 'react-native';

const iconPaths = {
  activity: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  ambulance: ['M10 17H6a3 3 0 0 1-3-3v-3h13v6', 'M16 8h2l3 3v3a3 3 0 0 1-3 3h-2', 'M6 17a2 2 0 1 0 4 0', 'M16 17a2 2 0 1 0 4 0', 'M9 6v5', 'M6.5 8.5h5'],
  arrowLeft: ['M19 12H5', 'M12 19l-7-7 7-7'],
  barChart: ['M3 3v18h18', 'M7 16v-5', 'M12 16V7', 'M17 16v-8'],
  bike: ['M5.5 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M18.5 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M15 6h3l-3 5H9l3-5', 'M7 6h3'],
  bot: ['M12 8V4', 'M8 4h8', 'M5 10a7 7 0 0 1 14 0v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-6Z', 'M9 13h.01', 'M15 13h.01', 'M9 17h6'],
  building: ['M3 21h18', 'M5 21V7l8-4v18', 'M19 21V11l-6-4', 'M9 9h.01', 'M9 13h.01', 'M9 17h.01', 'M15 13h.01', 'M15 17h.01'],
  car: ['M5 17h14l1-6-3-5H7l-3 5 1 6Z', 'M7 17a2 2 0 1 0 4 0', 'M13 17a2 2 0 1 0 4 0', 'M7 11h10'],
  check: ['M20 6 9 17l-5-5'],
  chevronRight: ['M9 18l6-6-6-6'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  creditCard: ['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z', 'M3 10h18', 'M7 15h3'],
  fileText: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8', 'M8 9h2'],
  headset: ['M4 14v-2a8 8 0 0 1 16 0v2', 'M4 14a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2v2Z', 'M20 14a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2v2Z', 'M18 16v1a4 4 0 0 1-4 4h-2'],
  history: ['M3 12a9 9 0 1 0 3-6.7', 'M3 3v6h6', 'M12 7v5l3 2'],
  home: ['M3 11l9-8 9 8', 'M5 10v11h14V10', 'M9 21v-6h6v6'],
  invoice: ['M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  landmark: ['M3 21h18', 'M4 10h16', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M12 3l8 5H4l8-5Z'],
  location: ['M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z', 'M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  logOut: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  mail: ['M4 4h16v16H4V4Z', 'm4 7 4 4 4-4'],
  map: ['M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z', 'M9 3v15', 'M15 6v15'],
  mapPin: ['M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z', 'M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  message: ['M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z'],
  package: ['M21 8 12 3 3 8l9 5 9-5Z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z'],
  pill: ['M10.5 20.5 20.5 10.5a5 5 0 0 0-7-7L3.5 13.5a5 5 0 0 0 7 7Z', 'M8.5 8.5l7 7'],
  restaurant: ['M7 2v20', 'M4 2v6a3 3 0 0 0 6 0V2', 'M17 2v20', 'M14 2h6v9h-6V2Z'],
  route: ['M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M9 16h3a4 4 0 0 0 0-8h3'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'M9 12l2 2 4-4'],
  shoppingCart: ['M6 6h15l-1.5 9h-12L5 2H2', 'M8 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z', 'M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'],
  siren: ['M7 18v-6a5 5 0 0 1 10 0v6', 'M5 18h14', 'M4 22h16', 'M12 2v3', 'M4.9 5.6 7 7.7', 'M19.1 5.6 17 7.7'],
  smartphone: ['M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M11 18h2'],
  star: ['M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M6 6l1 15h10l1-15', 'M10 11v6', 'M14 11v6'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  wallet: ['M3 7a2 2 0 0 1 2-2h14v14H5a2 2 0 0 1-2-2V7Z', 'M16 12h5v5h-5a2.5 2.5 0 0 1 0-5Z'],
  warning: ['M12 9v4', 'M12 17h.01', 'M10.3 3.9 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'],
};

const fallback = {
  activity: 'A', ambulance: 'AM', arrowLeft: '<', barChart: 'B', bike: 'BI', bot: 'AI',
  building: 'H', car: 'C', check: 'OK', chevronRight: '>', clock: 'T', creditCard: 'CC',
  fileText: 'F', headset: 'S', history: 'H', home: 'HM', invoice: 'I', landmark: 'L',
  location: 'P', logOut: 'X', mail: 'M', map: 'MP', mapPin: 'P', message: 'M',
  package: 'PK', phone: 'PH', pill: 'RX', restaurant: 'R', route: 'RT', shield: 'SH',
  shoppingCart: 'C', siren: 'SOS', smartphone: 'UPI', star: '*', trash: 'DEL',
  user: 'U', wallet: 'W', warning: '!',
};

export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style }) {
  const paths = iconPaths[name] || iconPaths.activity;

  if (Platform.OS !== 'web') {
    return (
      <Text style={[{ color, fontSize: Math.max(10, size * 0.55), fontWeight: '900' }, style]}>
        {fallback[name] || fallback.activity}
      </Text>
    );
  }

  return React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: { display: 'block', flexShrink: 0, ...style },
      'aria-hidden': true,
    },
    paths.map((d, index) => React.createElement('path', { key: index, d }))
  );
}

export function IconText({ name, children, color, size = 16, gap = 6, style, textStyle }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>
      <Icon name={name} size={size} color={color} />
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}
