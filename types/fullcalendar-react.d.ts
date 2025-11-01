declare module '@fullcalendar/react' {
  import { ComponentType } from 'react';
  const FullCalendar: ComponentType<any>;
  export default FullCalendar;
}

declare module '@fullcalendar/daygrid' {
  const dayGridPlugin: any;
  export default dayGridPlugin;
}

declare module '@fullcalendar/interaction' {
  const interactionPlugin: any;
  export default interactionPlugin;
}

declare module '@fullcalendar/core' {
  const core: any;
  export default core;
}

declare module "@fullcalendar/core/locales/*" {
  const locale: any;
  export default locale;
}
