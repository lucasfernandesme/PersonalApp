const fs = require('fs');
const path = require('path');

// App.tsx - Replace handleSaveScheduleEvent using line-based approach
const appPath = path.join(__dirname, 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
const lines = appContent.split('\n');

// Find start and end lines of handleSaveScheduleEvent
let startLine = -1, endLine = -1;
for (let i = 0; i < lines.length; i++) {
  const trimmed = lines[i].trim();
  if (trimmed.startsWith('const handleSaveScheduleEvent = async')) {
    startLine = i;
  }
  if (startLine >= 0 && endLine < 0 && i > startLine && trimmed === '};') {
    endLine = i;
    break;
  }
}

if (startLine < 0 || endLine < 0) {
  console.error('Could not find handleSaveScheduleEvent in App.tsx!');
  console.error('startLine:', startLine, 'endLine:', endLine);
  process.exit(1);
}

console.log(`Found handleSaveScheduleEvent at lines ${startLine + 1} to ${endLine + 1}`);

// New implementation (uses same indentation - 2 spaces)
const newImpl = `  const handleSaveScheduleEvent = async (eventData: any) => {
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

        const eventsToSave = [];

        for (const dayOfWeek of eventData.recurringDays) {
          for (let week = 0; week < weeksToRepeat; week++) {
            const baseDayOfWeek = baseStart.getDay();
            const daysToAdd = (dayOfWeek - baseDayOfWeek + 7) % 7;
            const eventDate = addDaysUtil(baseStart, daysToAdd + week * 7);

            const eventStart = new Date(eventDate);
            eventStart.setHours(baseStart.getHours(), baseStart.getMinutes(), 0, 0);
            const eventEnd = new Date(eventStart.getTime() + durationMs);

            eventsToSave.push({
              ...basePayload,
              id: Math.random().toString(36).substring(2, 11),
              isRecurring: false,
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

// Replace the lines
const newLines = [
  ...lines.slice(0, startLine),
  ...newImpl.split('\n'),
  ...lines.slice(endLine + 1)
];

fs.writeFileSync(appPath, newLines.join('\n'), 'utf8');
console.log('[2/2] App.tsx patched successfully');
console.log('All done!');
