import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

async function enableMocking(): Promise<void> {
  if (!environment.useMocks) {
    return;
  }
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledFrame: 'bypass' });
}

enableMocking()
  .then(() => bootstrapApplication(AppComponent, appConfig))
  .catch((err) => console.error(err));
