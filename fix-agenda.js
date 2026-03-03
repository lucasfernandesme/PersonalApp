const fs = require('fs');
const path = require('path');

// ==========================================
// Fix 1: ScheduleEventModal.tsx
// ==========================================
const modalPath = path.join(__dirname, 'components', 'ScheduleEventModal.tsx');
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Add parseISO to date-fns import
modalContent = modalContent.replace(
  "import { format, addHours, parse } from 'date-fns';",
  "import { format, addHours, parse, parseISO } from 'date-fns';"
);

// Use parseISO to parse existing event dates (avoids UTC offset issues)
modalContent = modalContent.replace(
  'const startDate = new Date(existingEvent.start);',
  'const startDate = parseISO(existingEvent.start);'
);
modalContent = modalContent.replace(
  'const endDate = new Date(existingEvent.end);',
  'const endDate = parseISO(existingEvent.end);'
);

// Save as local ISO string instead of UTC (toISOString adds Z and converts to UTC)
modalContent = modalContent.replace(
  'const startISO = startDateTime.toISOString();',
  "const startISO = format(startDateTime, \"yyyy-MM-dd'T'HH:mm:ss\");"
);
modalContent = modalContent.replace(
  'const endISO = endDateTime.toISOString();',
  "const endISO = format(endDateTime, \"yyyy-MM-dd'T'HH:mm:ss\");"
);

fs.writeFileSync(modalPath, modalContent, 'utf8');
console.log('[1/2] ScheduleEventModal.tsx patched successfully');

// ==========================================
// Fix 2: App.tsx - replication logic
// ==========================================
const appPath = path.join(__dirname, 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Add addDays and parseISO imports from date-fns if not already present
// Check if date-fns is imported in App.tsx
if (!appContent.includes("from 'date-fns'")) {
  // No date-fns import - add one after the last import
  // Actually let's just add it inline in the function
}

// Replace handleSaveScheduleEvent with the version that generates recurring events
const oldHandleSave = `  const handleSaveScheduleEvent = async (eventData: any) => {
    try {
      if (!authUser?.id) return;

      const payload = {
        ...eventData,
        trainerId: authUser.id,
        id: eventToEdit?.id || Math.random().toString(36).substring(2, 11)
      };

      await DataService.saveScheduleEvent(payload);
      await reloadEvents();
      setIsEventModalOpen(false);
      setEventToEdit(undefined);
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
      alert("Erro ao salvar agendamento.");
    }
  };`;

const newHandleSave = `  const handleSaveScheduleEvent = async (eventData: any) => {
    try {
      if (!authUser?.id) return;

      const basePayload = {
        ...eventData,
        trainerId: authUser.id,
      };

      // If creating a NEW recurring event with days selected, generate one event per day per week
      if (!eventToEdit && eventData.isRecurring && eventData.recurringDays && eventData.recurringDays.length > 0) {
        const { parseISO: parseDateISO, format: formatDate, addDays: addDaysUtil } = await import('date-fns');
        const baseStart = parseDateISO(eventData.start);
        const baseEnd = parseDateISO(eventData.end);
        const durationMs = baseEnd.getTime() - baseStart.getTime();
        const weeksToRepeat = eventData.recurrenceDuration || 4;

        const eventsToSave: any[] = [];

        for (const dayOfWeek of eventData.recurringDays as number[]) {
          for (let week = 0; week < weeksToRepeat; week++) {
            // Calculate days to add to reach the target weekday
            const baseDayOfWeek = baseStart.getDay();
            let daysToAdd = (dayOfWeek - baseDayOfWeek + 7) % 7;
            // For week 0, same weekday means 0 days to add (today or in the same week)
            const eventDate = addDaysUtil(baseStart, daysToAdd + week * 7);

            const eventStart = new Date(eventDate);
            eventStart.setHours(baseStart.getHours(), baseStart.getMinutes(), 0, 0);
            const eventEnd = new Date(eventStart.getTime() + durationMs);

            eventsToSave.push({
              ...basePayload,
              id: Math.random().toString(36).substring(2, 11),
              isRecurring: false, // Each generated event is standalone
              recurringDays: undefined,
              recurringMonths: undefined,
              recurrenceDuration: undefined,
              start: formatDate(eventStart, "yyyy-MM-dd'T'HH:mm:ss"),
              end: formatDate(eventEnd, "yyyy-MM-dd'T'HH:mm:ss"),
            });
          }
        }

        for (const event of eventsToSave) {
          await DataService.saveScheduleEvent(event);
        }
      } else {
        // Single event: new or edit
        const payload = {
          ...basePayload,
          id: eventToEdit?.id || Math.random().toString(36).substring(2, 11),
        };
        await DataService.saveScheduleEvent(payload);
      }

      await reloadEvents();
      setIsEventModalOpen(false);
      setEventToEdit(undefined);
    } catch (err) {
      console.error("Erro ao salvar evento:", err);
      alert("Erro ao salvar agendamento.");
    }
  };`;

if (!appContent.includes(oldHandleSave.trim())) {
  console.error('[2/2] Could not find handleSaveScheduleEvent to replace in App.tsx!');
  console.log('First 50 chars of old:', JSON.stringify(oldHandleSave.substring(0, 50)));
  // Try a shorter match
  const shortMatch = `  const handleSaveScheduleEvent = async (eventData: any) => {`;
  const idx = appContent.indexOf(shortMatch);
  console.log('Short match index:', idx);
  process.exit(1);
}

appContent = appContent.replace(oldHandleSave, newHandleSave);
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('[2/2] App.tsx patched successfully');
console.log('All done!');
