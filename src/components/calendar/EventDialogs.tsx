import React from 'react';
import { format } from 'date-fns';
import { DialogTitle, DialogDescription, DialogHeader, DialogContent, Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, MapPin, Calendar, Pencil, Trash } from 'lucide-react';
import EventForm from '@/components/event-form/EventForm';

interface EventDialogsProps {
  isNewEventDialogOpen: boolean;
  setIsNewEventDialogOpen: (open: boolean) => void;
  isViewEventDialogOpen: boolean;
  setIsViewEventDialogOpen: (open: boolean) => void;
  selectedEvent: Event | null;
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  selectedDate: Date;
  handleCreateEvent: (eventData: Omit<Event, 'id' | 'calendarId'>) => void;
  handleUpdateEvent: (eventData: Omit<Event, 'id' | 'calendarId'>) => void;
  handleDeleteEvent: () => void;
}

const EventDialogs = ({
  isNewEventDialogOpen,
  setIsNewEventDialogOpen,
  isViewEventDialogOpen,
  setIsViewEventDialogOpen,
  selectedEvent,
  isEditMode,
  setIsEditMode,
  selectedDate,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent
}: EventDialogsProps) => {

  return (
    <>
      {/* New Event Dialog */}
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar.
            </DialogDescription>
          </DialogHeader>
          
          <EventForm
            initialValues={{
              title: '',
              description: '',
              allDay: false,
              start: selectedDate,
              end: selectedDate,
              color: '',
              recurrence: undefined
            }}
            onSubmit={handleCreateEvent}
            onCancel={() => setIsNewEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View/Edit Event Dialog */}
      {selectedEvent && (
        <Dialog 
          open={isViewEventDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setIsEditMode(false);
            }
            setIsViewEventDialogOpen(open);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{isEditMode ? 'Edit Event' : selectedEvent.title}</DialogTitle>
                {selectedEvent.isHoliday && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2">
                    Holiday
                  </Badge>
                )}
              </div>
              
              {!isEditMode && (
                <DialogDescription>
                  {selectedEvent.description || 'No description'}
                </DialogDescription>
              )}
            </DialogHeader>
            
            {isEditMode ? (
              <EventForm
                initialValues={{
                  title: selectedEvent.title,
                  description: selectedEvent.description || '',
                  allDay: selectedEvent.allDay,
                  start: selectedEvent.start,
                  end: selectedEvent.end,
                  color: selectedEvent.color || '',
                  recurrence: selectedEvent.recurrence
                }}
                onSubmit={handleUpdateEvent}
                onCancel={() => setIsEditMode(false)}
              />
            ) : (
              <>
                {!selectedEvent.isHoliday && (
                  <div className="flex justify-end space-x-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditMode(true)}
                      disabled={selectedEvent.isHoliday}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleDeleteEvent}
                      disabled={selectedEvent.isHoliday}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
                
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {selectedEvent.recurrence && (
                      <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-3 py-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {selectedEvent.allDay ? (
                          <span>All day</span>
                        ) : (
                          <span>
                            {format(new Date(selectedEvent.start), 'h:mm a')} - 
                            {format(new Date(selectedEvent.end), 'h:mm a')}
                          </span>
                        )}
                      </div>
                      
                      {selectedEvent.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {selectedEvent.description && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm">{selectedEvent.description}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  {selectedEvent.recurrence && (
                    <TabsContent value="recurrence" className="space-y-4">
                      <div className="grid gap-3 py-3">
                        <div className="flex items-start">
                          <Check className="h-4 w-4 mr-2 mt-1" />
                          <div>
                            <p className="font-medium">Repeats every{' '}
                              {selectedEvent.recurrence.interval > 1 && selectedEvent.recurrence.interval}{' '}
                              {selectedEvent.recurrence.frequency}
                              {selectedEvent.recurrence.interval > 1 && 's'}
                            </p>
                            
                            {selectedEvent.recurrence.endDate && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Until {format(new Date(selectedEvent.recurrence.endDate), 'MMMM d, yyyy')}
                              </p>
                            )}
                            
                            {selectedEvent.recurrence.count && !selectedEvent.recurrence.endDate && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Repeats {selectedEvent.recurrence.count} times
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EventDialogs;
