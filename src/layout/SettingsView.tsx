import LlmSettingsTable from "@/features/LlmSettingsTable/LlmSettingsTable";

type SettingsViewProps = {
    onBackHome: () => void;
};

const SettingsView = ({ onBackHome }: SettingsViewProps) => {
    return (
        <section className="main-view-settings main-view-grid-surface" aria-labelledby="settings-view-title">
            <header className="main-view-settings-header">
                <p className="eyebrow-text eyebrow-text-md">Settings</p>
                <h1 className="main-view-settings-title" id="settings-view-title">Model and provider configuration</h1>
            </header>
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
