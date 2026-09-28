import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  // Pizzas
  {
    id: 'pizza-margherita',
    name: 'Margherita',
    category: 'pizza',
    price: 8.99,
    emoji: '🍕',
    variants: [
      { name: 'Small', price: 8.99 },
      { name: 'Medium', price: 11.99 },
      { name: 'Large', price: 14.99 }
    ]
  },
  {
    id: 'pizza-pepperoni',
    name: 'Pepperoni',
    category: 'pizza',
    price: 10.99,
    emoji: '🍕',
    variants: [
      { name: 'Small', price: 10.99 },
      { name: 'Medium', price: 13.99 },
      { name: 'Large', price: 16.99 }
    ]
  },
  {
    id: 'pizza-veggie',
    name: 'Veggie Supreme',
    category: 'pizza',
    price: 9.99,
    emoji: '🥬',
    variants: [
      { name: 'Small', price: 9.99 },
      { name: 'Medium', price: 12.99 },
      { name: 'Large', price: 15.99 }
    ]
  },
  {
    id: 'pizza-bbq-chicken',
    name: 'BBQ Chicken',
    category: 'pizza',
    price: 11.99,
    emoji: '🍗',
    variants: [
      { name: 'Small', price: 11.99 },
      { name: 'Medium', price: 14.99 },
      { name: 'Large', price: 17.99 }
    ]
  },
  // Burgers
  {
    id: 'burger-classic',
    name: 'Classic Burger',
    category: 'burger',
    price: 7.99,
    emoji: '🍔',
  },
  {
    id: 'burger-cheese',
    name: 'Cheese Burger',
    category: 'burger',
    price: 8.99,
    emoji: '🧀',
  },
  {
    id: 'burger-chicken',
    name: 'Chicken Burger',
    category: 'burger',
    price: 8.49,
    emoji: '🍔',
  },
  {
    id: 'burger-double',
    name: 'Double Smash',
    category: 'burger',
    price: 11.99,
    emoji: '🔥',
  },
  // Shawarma
  {
    id: 'shawarma-chicken',
    name: 'Chicken Shawarma',
    category: 'shawarma',
    price: 6.99,
    emoji: '🌯',
    variants: [
      { name: 'Wrap', price: 6.99 },
      { name: 'Plate', price: 9.99 }
    ]
  },
  {
    id: 'shawarma-meat',
    name: 'Meat Shawarma',
    category: 'shawarma',
    price: 7.99,
    emoji: '🌯',
    variants: [
      { name: 'Wrap', price: 7.99 },
      { name: 'Plate', price: 10.99 }
    ]
  },
  {
    id: 'shawarma-falafel',
    name: 'Falafel Shawarma',
    category: 'shawarma',
    price: 5.99,
    emoji: '🧆',
    variants: [
      { name: 'Wrap', price: 5.99 },
      { name: 'Plate', price: 8.99 }
    ]
  },
  // Sides
  {
    id: 'fries',
    name: 'French Fries',
    category: 'sides',
    price: 3.49,
    emoji: '🍟',
  },
  {
    id: 'onion-rings',
    name: 'Onion Rings',
    category: 'sides',
    price: 4.49,
    emoji: '🧅',
  },
  {
    id: 'salad',
    name: 'Fresh Salad',
    category: 'sides',
    price: 4.99,
    emoji: '🥗',
  },
  {
    id: 'garlic-bread',
    name: 'Garlic Bread',
    category: 'sides',
    price: 3.99,
    emoji: '🧄',
  },
  // Drinks
  {
    id: 'cola',
    name: 'Cola',
    category: 'drinks',
    price: 1.99,
    emoji: '🥤',
  },
  {
    id: 'juice',
    name: 'Fresh Juice',
    category: 'drinks',
    price: 3.49,
    emoji: '🧃',
  },
  {
    id: 'water',
    name: 'Water',
    category: 'drinks',
    price: 0.99,
    emoji: '💧',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    category: 'drinks',
    price: 2.49,
    emoji: '☕',
  },
];

export const categories = [
  { id: 'all', name: 'All', emoji: '📋' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'burger', name: 'Burgers', emoji: '🍔' },
  { id: 'shawarma', name: 'Shawarma', emoji: '🌯' },
  { id: 'sides', name: 'Sides', emoji: '🍟' },
  { id: 'drinks', name: 'Drinks', emoji: '🥤' },
];
