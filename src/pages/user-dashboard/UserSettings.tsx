import React from "react";

const UserSettings = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">
        Manage your account settings and preferences.
      </p>
      <div className="mt-6 border rounded-xl p-8 bg-card">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-muted-foreground">
              This is how others will see you on the site.
            </p>
          </div>
          <div className="h-[1px] bg-border" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configure how you receive alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
