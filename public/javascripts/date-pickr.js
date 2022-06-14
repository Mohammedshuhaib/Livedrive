flatpickr(
  '#book_pick_date',
  {
    altInput: true,
    minDate: 'today',
    allowInput: true,
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d',
    disableMobile: 'true',

    onChange(selectedDates) {
      flatpickr(
        '#book_off_date',
        {
          altInput: true,
          
          position: 'left',
          dateFormat: 'Y-m-d',
          minDate: selectedDates[0].setDate(selectedDates[0].getDate() + 1),
          defaultDate: selectedDates[0].setDate(selectedDates[0].getDate()),
          altFormat: 'F j, Y',
          allowInput: true,
          disableMobile: 'true',
          onChange(selectedDates) {
            const dateToForm = selectedDates[0];
          },
        },
      );
    },
  },
);
