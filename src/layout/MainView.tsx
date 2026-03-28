import '@/styles/layout.css';

import SettingsView from './SettingsView/SettingsView';
import HomeView from './HomeView/HomeView';
import { useNavigation } from '@/app/providers/useNavigation';


const MainView = () => {
    const { navigationState } = useNavigation();

    function renderContent() {
        switch (navigationState.kind) {
            case "home":
                return <HomeView />;
            case "settings":
                return <SettingsView />
            default:
                return null;
        }
    }

    const content = renderContent();

    return (
        <>
            {content}
        </>
    );
};

export default MainView;
