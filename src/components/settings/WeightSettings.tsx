import { useAtom } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Label } from '@/components/ui/label';
import { settingsAtom } from '@/stores/appStore';
import { getWeightGradientColor } from '@/utils/color';
import { STORY_WEIGHTS } from '@/constants/story';

export function WeightSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleWeightBaseColorChange = (color: string) => {
    setSettings({
      ...settings,
      weightBaseColor: color
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Settings</CardTitle>
        <CardDescription>
          Configure the weight gradient colors for story weights. The base color will be used to generate gradient colors for different weight values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Weight Base Color */}
          <div className="space-y-2">
            <Label htmlFor="weight-base-color">Weight Base Color</Label>
            <div className="flex items-center gap-4">
              <ColorPicker
                value={settings.weightBaseColor || '#3B82F6'}
                onChange={handleWeightBaseColorChange}
              />
              <div className="text-sm text-muted-foreground">
                This color will be used as the base for the weight gradient
              </div>
            </div>
          </div>

          {/* Weight Preview */}
          <div className="space-y-2">
            <Label>Weight Gradient Preview</Label>
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              {STORY_WEIGHTS.map(weight => {
                const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor || '#3B82F6', 21);
                return (
                  <div key={weight} className="flex flex-col items-center gap-1">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: gradientColor }}
                      title={`Weight ${weight}`}
                    />
                    <span className="text-xs text-muted-foreground">{weight}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              Higher weights will have lighter colors in the gradient
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
