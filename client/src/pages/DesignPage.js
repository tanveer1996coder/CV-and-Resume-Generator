import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { Layout, Star, Briefcase, PenTool, Hash, Coffee } from 'lucide-react';

const DesignPage = () => {
    const navigate = useNavigate();
    const { setDesign } = useResume();

    const designs = [
        {
            id: 'modern',
            name: 'Modern Clean',
            icon: Layout,
            color: 'bg-blue-100 text-blue-600',
            description: 'Clean two-column layout with a fresh look. Perfect for tech and startups.'
        },
        {
            id: 'professional',
            name: 'Professional',
            icon: Briefcase,
            color: 'bg-slate-100 text-slate-700',
            description: 'Traditional, authoritative design. Ideal for corporate, legal, and finance roles.'
        },
        {
            id: 'creative',
            name: 'Creative',
            icon: PenTool,
            color: 'bg-purple-100 text-purple-600',
            description: 'Bold colors and geometric accents. Great for designers and artists.'
        },
        {
            id: 'executive',
            name: 'Executive',
            icon: Star,
            color: 'bg-indigo-100 text-indigo-700',
            description: 'Sophisticated dark sidebar with elegant typography. Commands attention.'
        },
        {
            id: 'minimal',
            name: 'Minimalist',
            icon: Hash,
            color: 'bg-gray-100 text-gray-600',
            description: 'Simple, typography-focused single column. Focuses purely on content.'
        },
        {
            id: 'chicago',
            name: 'Chicago',
            icon: Coffee,
            color: 'bg-amber-100 text-amber-700',
            description: 'Classic serif design with traditional formatting. Best for law, academia, and government.'
        },
        {
            id: 'tajmahal',
            name: 'Taj Mahal',
            icon: Briefcase,
            color: 'bg-blue-100 text-blue-700',
            description: 'Professional two-column with colored sidebar. Perfect for corporate and business roles.'
        },
        {
            id: 'windsor',
            name: 'Windsor',
            icon: Star,
            color: 'bg-purple-100 text-purple-700',
            description: 'Elegant timeline design with sophisticated styling. Stands out in competitive fields.'
        }
    ];

    const handleSelect = (id) => {
        setDesign(id);
        navigate('/editor');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8 text-center">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Choose Your Look</h2>
                    <p className="mt-2 text-lg text-gray-600">Select a design that fits your industry and personality.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {designs.map((design) => (
                        <div
                            key={design.id}
                            onClick={() => handleSelect(design.id)}
                            className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-400 relative"
                        >
                            <div className={`h-24 ${design.color} flex items-center justify-center transition-colors`}>
                                <design.icon size={48} className="opacity-80 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{design.name}</h3>
                                <p className="text-gray-500 text-sm">{design.description}</p>
                            </div>
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                Select
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/categories')}
                    className="mt-8 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    &larr; Back to Categories
                </button>
            </div>
        </div>
    );
};

export default DesignPage;
