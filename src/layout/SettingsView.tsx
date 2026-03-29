import LlmSettingsTable from "@/features/LlmSettingsTable/LlmSettingsTable";
import { useThemeContext } from "@/app/providers/useTheme";
import type { ThemeName } from "@/app/types/theme";

type ThemeOption = {
    name: ThemeName;
    label: string;
    description: string;
    swatches: string[];
};

const themeOptions: ThemeOption[] = [
    {
        name: "sunny-playroom",
        label: "Sunny Playroom",
        description: "Warm, bright, and friendly — like a cozy room on a sunny day.",
        swatches: ["#fef9f0", "#e08a2e", "#fce4c4"],
    },
    {
        name: "forest-adventure",
        label: "Forest Adventure",
        description: "Calm and curious — a nature walk through green meadows.",
        swatches: ["#f3f7f0", "#4a8c3f", "#d4eacd"],
    },
    {
        name: "ocean-lab",
        label: "Ocean Lab",
        description: "Clean and energetic — a bright underwater science lab.",
        swatches: ["#eef5fa", "#2e85c5", "#c3e0f5"],
    },
];

type SettingsViewProps = {
    onBackHome: () => void;
};

const SettingsView = ({ onBackHome }: SettingsViewProps) => {
    const { theme, setTheme } = useThemeContext();

    return (
        <section className="main-view-settings" aria-labelledby="settings-view-title">
            <header className="main-view-settings-header">
                <p className="eyebrow-text eyebrow-text-md">Settings</p>
                <h1 id="settings-view-title">App settings</h1>
            </header>

            <div className="theme-selector" role="radiogroup" aria-label="Choose a theme">
                <h2 className="theme-selector-label">Theme</h2>
                <div className="theme-selector-options">
                    {themeOptions.map((option) => {
                        const isActive = theme === option.name;
                        return (
                            <button
                                key={option.name}
                                className={`theme-selector-card${isActive ? " is-active" : ""}`}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => setTheme(option.name)}
                            >
                                <div className="theme-selector-swatches">
                                    {option.swatches.map((color) => (
                                        <span
                                            key={color}
                                            className="theme-selector-swatch"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <span className="theme-selector-card-name">{option.label}</span>
                                <span className="theme-selector-card-description">{option.description}</span>
                                {isActive ? (
                                    <span className="theme-selector-active-badge">Active</span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            <LlmSettingsTable />

            <footer className="main-view-settings-footer">
                <button className="main-view-settings-back-button" type="button" onClick={onBackHome}>
                    Back home
                </button>
            </footer>
        </section>
    );
};

export default SettingsView;
