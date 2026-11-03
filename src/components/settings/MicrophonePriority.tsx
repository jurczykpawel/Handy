import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/Dropdown";
import { Button } from "../ui/Button";
import { SettingContainer } from "../ui/SettingContainer";
import { useSettings } from "../../hooks/useSettings";

interface MicrophonePriorityProps {
  descriptionMode?: "inline" | "tooltip";
  grouped?: boolean;
}

/**
 * Ordered list of preferred microphones. The first connected one is used;
 * when none is connected, the regular microphone setting applies.
 */
export const MicrophonePriority: React.FC<MicrophonePriorityProps> = React.memo(
  ({ descriptionMode = "tooltip", grouped = false }) => {
    const { t } = useTranslation();
    const {
      getSetting,
      updateSetting,
      isUpdating,
      isLoading,
      audioDevices,
      refreshAudioDevices,
    } = useSettings();

    const priority = (getSetting("microphone_priority") as string[]) ?? [];
    const busy = isUpdating("microphone_priority") || isLoading;
    const connected = new Set(audioDevices.map((d) => d.name));

    const save = (next: string[]) => updateSetting("microphone_priority", next);

    const move = (index: number, delta: number) => {
      const next = [...priority];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      save(next);
    };

    const addOptions = audioDevices
      .filter((d) => d.name !== "Default" && !priority.includes(d.name))
      .map((d) => ({ value: d.name, label: d.name }));

    return (
      <>
        <SettingContainer
          title={t("settings.sound.microphonePriority.title")}
          description={t("settings.sound.microphonePriority.description")}
          descriptionMode={descriptionMode}
          grouped={grouped}
        >
          <Dropdown
            options={addOptions}
            selectedValue={null}
            onSelect={(name) => save([...priority, name])}
            placeholder={t("settings.sound.microphonePriority.add")}
            disabled={busy || addOptions.length === 0}
            onOpen={refreshAudioDevices}
          />
        </SettingContainer>
        {priority.length > 0 && (
          <ol
            className={`px-4 p-2 ${grouped ? "" : "rounded-lg border border-line"} flex flex-col gap-1`}
          >
            {priority.map((name, index) => (
              <li key={name} className="flex items-center gap-2 text-sm">
                <span className="w-5 text-right opacity-60">{index + 1}.</span>
                <span className="flex-1 truncate">
                  {name}
                  {!connected.has(name) && (
                    <span className="ml-2 opacity-60">
                      {t("settings.sound.microphonePriority.disconnected")}
                    </span>
                  )}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => move(index, -1)}
                  disabled={busy || index === 0}
                  aria-label={t("settings.sound.microphonePriority.moveUp", {
                    name,
                  })}
                >
                  ↑
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => move(index, 1)}
                  disabled={busy || index === priority.length - 1}
                  aria-label={t("settings.sound.microphonePriority.moveDown", {
                    name,
                  })}
                >
                  ↓
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => save(priority.filter((n) => n !== name))}
                  disabled={busy}
                  aria-label={t("settings.sound.microphonePriority.remove", {
                    name,
                  })}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </li>
            ))}
          </ol>
        )}
      </>
    );
  },
);

MicrophonePriority.displayName = "MicrophonePriority";
