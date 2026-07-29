export const abiaCenter = [5.5244, 7.5244];

export const busStops = {
  umuahia: [5.5244, 7.5244],
  aba: [5.1167, 7.3667],
  ohafia: [5.6167, 7.8333],
  bende: [5.5667, 7.6333],
  arochukwu: [5.3833, 7.5167]
};

export const routes = {
  ABA: [
    { id: 1, name: 'Osisioma to Park', stops: ['Osisioma Junction', 'Zonal Board', 'Bata', 'Park'], fare: 150, popularity: 45, eta: '15 min' },
    { id: 2, name: 'Opopo Junction to Park', stops: ['Opopo Junction', 'Park'], fare: 150, popularity: 30, eta: '8 min' },
    { id: 3, name: 'Park to Flyover', stops: ['Park', 'Uratta Junction', 'Ohabiam', 'Flyover'], fare: 150, popularity: 38, eta: '12 min' },
    { id: 4, name: 'Flyover to Osisioma', stops: ['Flyover', 'Tonimas', 'Osisioma'], fare: 150, popularity: 42, eta: '10 min' }
  ],
  UMUAHIA: [
    { id: 5, name: 'Ubakala to Isigate', stops: ['Ubakala', 'Isigate'], fare: 150, popularity: 35, eta: '10 min' },
    { id: 6, name: 'Isigate to Tower', stops: ['Isigate', 'Tower'], fare: 150, popularity: 28, eta: '7 min' },
    { id: 7, name: 'Isigate to Secretariat', stops: ['Isigate', 'Secretariat'], fare: 150, popularity: 32, eta: '12 min' },
    { id: 8, name: 'Isigate to Ohafia', stops: ['Isigate', 'Ohafia'], fare: 150, popularity: 25, eta: '15 min' }
  ],
  INTER: [
    { id: 9, name: 'Aba – Umuahia', stops: ['Aba', 'Umuahia'], fare: 800, popularity: 55, eta: '45 min' },
    { id: 10, name: 'Umuahia – Ohafia', stops: ['Umuahia', 'Ohafia'], fare: 1000, popularity: 48, eta: '60 min' }
  ]
};

export const prices = {
  standard: 350,
  premium: 500,
  express: 750
};

export const routeDetails = {
  route1: { name: 'Route A: Umuahia-Aba Express', duration: '~25 mins', fare: 350 },
  route2: { name: 'Route B: Bende Road', duration: '~35 mins', fare: 300 },
  route3: { name: 'Route C: Ohafia', duration: '~45 mins', fare: 250 }
};

export const busLocations = [
  { lat: 5.1066, lng: 7.3667, route: 'Osisioma' },
  { lat: 5.1156, lng: 7.3756, route: 'Park' },
  { lat: 5.1246, lng: 7.3845, route: 'Flyover' },
  { lat: 5.0976, lng: 7.3578, route: 'Zonal' },
  { lat: 5.1336, lng: 7.3934, route: 'Uratta' }
];

export const stopNames = {
  umuahia: 'Umuahia Main Park',
  aba: 'Aba City Terminal',
  ohafia: 'Ohafia Junction',
  bende: 'Bende Road',
  arochukwu: 'Arochukwu'
};