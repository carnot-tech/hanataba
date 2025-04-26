"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsForm() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");

  return (
    <form className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>通知</Label>
            <p className="text-sm text-muted-foreground">
              アプリからの通知を受け取る
            </p>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">テーマ</Label>
          <select
            id="theme"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
            <option value="system">システム設定に従う</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        設定を保存
      </Button>
    </form>
  );
}