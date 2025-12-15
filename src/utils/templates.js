// Modular Design System Configuration

// 1. Color Themes (10 Presets)
export const colorThemes = {
    slate: { primary: '#475569', secondary: '#94a3b8', accent: '#e2e8f0' },
    blue: { primary: '#2563eb', secondary: '#60a5fa', accent: '#dbeafe' },
    emerald: { primary: '#059669', secondary: '#34d399', accent: '#d1fae5' },
    violet: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#ede9fe' },
    rose: { primary: '#e11d48', secondary: '#fb7185', accent: '#ffe4e6' },
    amber: { primary: '#d97706', secondary: '#fbbf24', accent: '#fef3c7' },
    cyan: { primary: '#0891b2', secondary: '#22d3ee', accent: '#cffafe' },
    fuchsia: { primary: '#c026d3', secondary: '#e879f9', accent: '#fae8ff' },
    lime: { primary: '#65a30d', secondary: '#a3e635', accent: '#ecfccb' },
    neutral: { primary: '#262626', secondary: '#525252', accent: '#e5e5e5' }
};

// 2. Typography Systems (5 Pairings)
export const fontPairings = {
    inter: { header: '"Inter", sans-serif', body: '"Inter", sans-serif' },
    merriweather: { header: '"Merriweather", serif', body: '"Open Sans", sans-serif' },
    roboto: { header: '"Roboto", sans-serif', body: '"Roboto Slab", serif' },
    playfair: { header: '"Playfair Display", serif', body: '"Lato", sans-serif' },
    oswald: { header: '"Oswald", sans-serif', body: '"Raleway", sans-serif' }
};

// 3. Layout Structures (5 Core Templates)
// These IDs correspond to render functions in the Preview Engine
export const layouts = [
    { id: 'modern', name: 'Modern Sidebar', type: 'sidebar-left' },
    { id: 'classic', name: 'Classic Professional', type: 'full-width' },
    { id: 'minimal', name: 'Minimalist', type: 'centered' },
    { id: 'executive', name: 'Executive Split', type: 'two-column' },
    { id: 'creative', name: 'Creative Header', type: 'header-heavy' },
];

/**
 * Helper to generate all unique combinations (250 Designs)
 * Used for the "Template Gallery" view.
 */
export function generateAllVariations() {
    const variations = [];
    layouts.forEach(layout => {
        Object.keys(colorThemes).forEach(themeKey => {
            Object.keys(fontPairings).forEach(fontKey => {
                variations.push({
                    layout: layout.id,
                    theme: themeKey,
                    font: fontKey,
                    id: `${layout.id}-${themeKey}-${fontKey}`
                });
            });
        });
    });
    return variations;
}
