
import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  onCancel: () => void;
  isEdit?: boolean;
}

const EventFormSubmitRow = ({ onCancel, isEdit }: Props) => (
  <div className="flex justify-end space-x-2 pt-4">
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit">
      {isEdit ? 'Update Event' : 'Create Event'}
    </Button>
  </div>
);

export default EventFormSubmitRow;
