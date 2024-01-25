import { useEffect, useState } from "react";
import Dropdown, { Option } from 'react-dropdown';

import './Hamburger.css';
import 'react-dropdown/style.css';

export default function Hamburger({ updateSettings }: { updateSettings: CallableFunction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [blurNSFW, setBlurNSFW] = useState(true);
    const [blurSuggestive, setBlurSuggestive] = useState(true);
    const [blurUntagged, setBlurUntagged] = useState(false);
    const [sortType, setSortType] = useState('newest');

    useEffect(() => { loadSettings() }, []);
    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify({ blurNSFW, blurSuggestive, blurUntagged, sort: sortType }));
    }, [blurNSFW, blurSuggestive, blurUntagged, sortType])

    window.onclick = function(e: any) { if (e.target.id !== 'settings-button') setIsOpen(false); }
    function toggleOpen(e?: any) {
        e?.stopPropagation();
        setIsOpen(!isOpen);
    }

    // Handlers
    function handleBlurNSFW(value: boolean) {
        setBlurNSFW(value);
        updateSettings({ blurNSFW: value });
    }
    function handleBlurSuggestive(value: boolean) {
        setBlurSuggestive(value);
        updateSettings({ blurSuggestive: value });
    }
    function handleBlurUntagged(value: boolean) {
        setBlurUntagged(value);
        updateSettings({ blurUntagged: value });
    }
    function handleSortChange(option: Option) {
        updateSettings({ sort: option.value });
        setSortType(option.value);
    }

    // Save/Load settings
    function loadSettings() {
        let settings = localStorage.getItem('settings');
        if (settings) {
            let parsed = JSON.parse(settings);
            if (parsed?.blurNSFW !== undefined) setBlurNSFW(parsed.blurNSFW);
            if (parsed?.blurSuggestive !== undefined) setBlurSuggestive(parsed.blurSuggestive);
            if (parsed?.blurUntagged !== undefined) setBlurUntagged(parsed.blurUntagged);
            if (parsed?.sort) setSortType(parsed.sort);
            updateSettings(parsed);
        }
    }

    // Data
    const sortOptions = [
        { value: 'newest', label: 'Newest', className: 'dropdown-option'},
        { value: 'oldest', label: 'Oldest', className: 'dropdown-option'},
        { value: 'newPosted', label: 'Newest Posted', className: 'dropdown-option'},
        { value: 'oldPosted', label: 'Oldest Posted', className: 'dropdown-option'},
    ];
    
    return (
        <div id="hamburger">
            <div id="settings-button" className="nav-button" onClick={toggleOpen}>
                <img src="/icons/settings.svg" alt="settings" className="nav-icon"/>
            </div>
            <div id="settings-menu" className={isOpen ? "open" : "closed"}>
                <ToggleOption label="Blur NSFW" current={blurNSFW} onChange={handleBlurNSFW}/>
                <ToggleOption label="Blur Suggestive" current={blurSuggestive} onChange={handleBlurSuggestive}/>
                <ToggleOption label="Blur Untagged" current={blurUntagged} onChange={handleBlurUntagged}/>
                <DropDownOption label="Sort by" options={sortOptions} current={sortType} onChange={handleSortChange}/>
            </div>
        </div>
    )
}

// Option components
function ToggleOption({ label, current, onChange }: { label: string, current: boolean, onChange: CallableFunction } ) {
    const [active, setActive] = useState(false);
    useEffect(() => {
        setActive(current);
    }, [current]);

    function flipToggle(e?: any) {
        e?.stopPropagation();
        setActive(!active);
        onChange(!active);
    }
    return (
        <div className="settings-item toggle-option" onClick={flipToggle}>
            <span className="label">{label}</span>
            <div className={ 'toggle ' + (active ? 'active' : '') }>
                <div className="toggle-circle"></div>
            </div>
        </div>
    )
}

function DropDownOption({ label, options, current, onChange }: { label: string, options: any, current: string, onChange: (arg: Option) => void } ) {
    const [value, setValue] = useState(options[0]);
    useEffect(() => {
        setValue(options.find((option: Option) => option.value === current));
    }, [current]);
    
    return (
        <div className="settings-item dropdown-option" onClick={(e) => { e.stopPropagation() }}>
            <span className="label">{label}</span>
            <Dropdown
                options={options} onChange={onChange} placeholder="Newest" value={value}
                controlClassName="dropdown-control" arrowClassName="dropdown-arrow" menuClassName="dropdown-menu" 
            />
        </div>
    )
};