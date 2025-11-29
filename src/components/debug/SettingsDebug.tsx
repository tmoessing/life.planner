import { useAtom } from 'jotai';
import { settingsAtom } from '@/stores/settingsStore';
import { useProjectSettings } from '@/utils/settingsMirror';

export function SettingsDebug() {
  const [settings] = useAtom(settingsAtom);
  const projectSettings = useProjectSettings();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, background: 'white', padding: '10px', zIndex: 9999, border: '1px solid black' }}>
      <h3>Settings Debug</h3>
      <div>
        <strong>Raw settings.projectTypes:</strong>
        <pre>{JSON.stringify(settings.projectTypes, null, 2)}</pre>
      </div>
      <div>
        <strong>ProjectSettings.projectTypes:</strong>
        <pre>{JSON.stringify(projectSettings.projectTypes, null, 2)}</pre>
      </div>
      <div>
        <strong>All settings keys:</strong>
        <pre>{JSON.stringify(Object.keys(settings), null, 2)}</pre>
      </div>
    </div>
  );
}
