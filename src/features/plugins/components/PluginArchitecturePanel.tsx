import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLUGIN_SANDBOX_PRINCIPLES } from "@/constants/plugins";

export function PluginArchitecturePanel(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sandbox architecture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Plugins extend the CMS through service hooks and declared scopes. Third-party packages
          will run in isolated server boundaries without direct database access from UI layers.
        </p>

        <ul className="space-y-2 text-sm text-muted-foreground">
          {PLUGIN_SANDBOX_PRINCIPLES.map((principle) => (
            <li key={principle} className="flex gap-2">
              <span aria-hidden="true" className="text-primary">
                •
              </span>
              <span>{principle}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
