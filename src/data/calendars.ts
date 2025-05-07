
import { Calendar } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const initialCalendars: Calendar[] = [
  {
    id: uuidv4(),
    name: 'Personal',
    description: 'My personal calendar',
    color: '#3b82f6',
    showHolidays: true,
    events: []
  },
  {
    id: uuidv4(),
    name: 'Work',
    description: 'Work-related events and meetings',
    color: '#10b981',
    showHolidays: true,
    events: []
  }
];
