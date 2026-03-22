import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Settings</h1>

      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Profile</h2>
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" placeholder="Your name" className="mt-1.5 max-w-sm" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="@username" className="mt-1.5 max-w-sm" />
          </div>
        </div>
        <Button size="sm">Save</Button>
      </section>

      <Separator className="my-8" />

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          {[
            ["⌘ K", "Open command palette"],
            ["⌘ N", "New card"],
            ["⌘ /", "Focus search"],
            ["Esc", "Close sheet / dialog"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{desc}</span>
              <kbd className="text-xs font-mono bg-secondary px-2 py-1 rounded">{key}</kbd>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Danger Zone</h2>
        <Button variant="destructive" size="sm">Delete Account</Button>
      </section>
    </div>
  );
}
