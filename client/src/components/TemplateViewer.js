import React, { forwardRef } from 'react';
import { MapPin, Mail, Phone, Linkedin, Globe, Github } from 'lucide-react';

const TemplateViewer = forwardRef(({ data, templateId = 'modern' }, ref) => {
    // Helper to render section items based on type
    const renderItems = (section) => {
        if (!section.items || section.items.length === 0) return null;

        if (section.type === 'experience' || section.type === 'education') {
            return (
                <div className="space-y-4">
                    {section.items.map((item, idx) => (
                        <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-gray-800 text-lg">
                                    {item.position || item.degree}
                                </h4>
                                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                    {item.duration || item.year}
                                </span>
                            </div>
                            <div className="text-gray-700 font-semibold mb-1">
                                {item.company || item.institution}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }

        if (section.type === 'skills' || section.type === 'list') {
            return (
                <div className="flex flex-wrap gap-2">
                    {section.items.map((item, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium">
                            {typeof item === 'string' ? item : item.name}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    // --- Template Designs ---

    // 1. Modern Clean: Two-column, simple, effective.
    const ModernClean = () => (
        <div className="w-full h-full bg-white p-8 font-sans text-gray-800 flex flex-col gap-6">
            <header className="border-b-2 border-gray-800 pb-6 mb-2 flex justify-between items-start">
                <div>
                    <h1 className="text-5xl font-bold uppercase tracking-tight text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-gray-600 font-medium mb-4">{data.personalInfo.role}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {data.personalInfo.email && <div className="flex items-center gap-1"><Mail size={14} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-1"><Phone size={14} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.linkedin && <div className="flex items-center gap-1"><Linkedin size={14} /> {data.personalInfo.linkedin}</div>}
                        {data.personalInfo.location && <div className="flex items-center gap-1"><MapPin size={14} /> {data.personalInfo.location}</div>}
                    </div>
                </div>
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 object-cover border-4 border-gray-200 rounded-lg shadow-sm" />
                )}
            </header>

            <div className="grid grid-cols-12 gap-8 h-full">
                {/* Main Column */}
                <div className="col-span-8 flex flex-col gap-6">
                    {data.summary && (
                        <section>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-3">Professional Profile</h3>
                            <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type === 'experience').map(section => (
                        <section key={section.id}>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-3">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>

                {/* Sidebar Column */}
                <div className="col-span-4 bg-gray-50 p-4 rounded-lg h-full flex flex-col gap-6">
                    {data.sections.filter(s => s.type !== 'experience').map(section => (
                        <section key={section.id}>
                            <h3 className="text-base font-bold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-3">{section.title}</h3>
                            {section.type === 'skills' || section.type === 'list' ? (
                                <div className="flex flex-wrap gap-2">
                                    {section.items.map((item, idx) => (
                                        <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold block w-full text-center shadow-sm">
                                            {typeof item === 'string' ? item : item.name}
                                        </span>
                                    ))}
                                </div>
                            ) : renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 2. Professional: Classic, elegant, serif headers, centered top.
    const Professional = () => (
        <div className="w-full h-full bg-white p-10 font-serif text-gray-800">
            <header className="text-center border-b-2 border-double border-gray-300 pb-8 mb-8">
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-2 border-gray-300" />
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-lg text-gray-600 italic mb-4">{data.personalInfo.role}</p>
                <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-500 font-sans">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                    {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
                </div>
            </header>

            <div className="space-y-8 font-sans">
                {data.summary && (
                    <section>
                        <h3 className="text-xl font-serif font-bold text-gray-800 border-b border-gray-300 mb-3 pb-1">Summary</h3>
                        <p className="text-sm leading-relaxed text-gray-700 text-justify">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-serif font-bold text-gray-800 border-b border-gray-300 mb-4 pb-1">{section.title}</h3>
                        <div className="pl-2">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 3. Creative: Pop of color, geometric, modern font.
    const Creative = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800 flex">
            {/* Left Sidebar */}
            <div className="w-1/3 bg-purple-900 text-white min-h-full p-8 flex flex-col gap-8">
                <div className="space-y-4">
                    <div className="w-32 h-32 bg-purple-400 rounded-full mx-auto border-4 border-white mb-4 overflow-hidden flex items-center justify-center">
                        {data.personalInfo.photo ? (
                            <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-white opacity-50">{data.personalInfo.fullName.charAt(0)}</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-center leading-tight">{data.personalInfo.fullName}</h1>
                    <p className="text-center text-purple-200 font-medium uppercase tracking-widest text-sm">{data.personalInfo.role}</p>
                </div>

                <div className="text-sm space-y-3 opacity-90">
                    {data.personalInfo.email && <div className="flex items-center gap-2 break-all"><Mail size={14} /> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={14} /> {data.personalInfo.phone}</div>}
                    {data.personalInfo.linkedin && <div className="flex items-center gap-2 break-all"><Linkedin size={14} /> {data.personalInfo.linkedin}</div>}
                    {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={14} /> {data.personalInfo.location}</div>}
                </div>

                <div className="flex-1 space-y-6">
                    {/* Render specific sections in sidebar like Skills */}
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'list' || s.type === 'education').map(section => (
                        <section key={section.id}>
                            <h4 className="text-lg font-bold text-purple-200 uppercase tracking-wider mb-4 border-b border-purple-700 pb-2">{section.title}</h4>
                            {section.type === 'education' ? (
                                section.items.map((item, idx) => (
                                    <div key={idx} className="mb-4 text-sm">
                                        <div className="font-bold">{item.degree}</div>
                                        <div className="text-purple-300">{item.institution}</div>
                                        <div className="text-purple-300 opacity-75">{item.year}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {section.items.map((item, idx) => (
                                        <span key={idx} className="bg-purple-800 text-white px-2 py-1 rounded text-xs">
                                            {typeof item === 'string' ? item : item.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </div>

            {/* Right Content */}
            <div className="w-2/3 p-10 flex flex-col gap-8">
                {data.summary && (
                    <section>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-3 uppercase">Profile</h3>
                        <p className="text-gray-600 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {data.sections.filter(s => s.type !== 'skills' && s.type !== 'list' && s.type !== 'education').map(section => (
                    <section key={section.id}>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-purple-500 pl-3 uppercase">{section.title}</h3>
                        {/* Creative Custom Render for Experience */}
                        {section.type === 'experience' ? (
                            <div className="relative border-l-2 border-purple-100 ml-3 space-y-8 pl-8 py-2">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full bg-purple-500 border-4 border-white shadow-sm"></span>
                                        <h4 className="font-bold text-xl text-gray-800">{item.position}</h4>
                                        <p className="text-purple-600 font-semibold text-sm mb-2">{item.company} | {item.duration}</p>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );

    // 4. Executive: Dark header, gold accents, authoritative.
    const Executive = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800">
            <header className="bg-gray-900 text-white p-10 flex items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-yellow-600"></div>
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 object-cover border-4 border-yellow-600 rounded shadow-lg z-10" />
                )}
                <div className="z-10">
                    <h1 className="text-5xl font-serif font-bold tracking-tight mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-yellow-500 tracking-widest uppercase font-medium">{data.personalInfo.role}</p>
                </div>
            </header>

            <div className="bg-gray-100 p-4 border-b border-gray-300 text-sm font-medium text-gray-600 flex justify-center gap-6">
                {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
            </div>

            <div className="p-10 max-w-4xl mx-auto space-y-8">
                {data.summary && (
                    <section className="text-center">
                        <p className="text-lg leading-relaxed text-gray-700 italic border-l-4 border-yellow-600 pl-4 py-2 bg-gray-50 text-left rounded-r">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <div className="flex items-center mb-6">
                            <div className="h-px bg-gray-300 flex-1"></div>
                            <h3 className="px-4 text-xl font-bold uppercase tracking-wider text-gray-900">{section.title}</h3>
                            <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        {renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );

    // 5. Minimalist: Single column, heavy use of whitespace, Helvetica-like.
    const Minimal = () => (
        <div className="w-full h-full bg-white p-12 font-sans flex flex-col gap-10 text-gray-900">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4">{data.personalInfo.fullName}</h1>
                    <p className="text-2xl text-gray-500 font-light mb-8">{data.personalInfo.role}</p>
                    <div className="flex gap-6 text-sm text-gray-600 font-medium">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                    </div>
                </div>
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 object-cover grayscale brightness-110 contrast-125" />
                )}
            </header>

            <main className="grid grid-cols-1 gap-12 max-w-3xl">
                {data.summary && (
                    <section>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">About</h4>
                        <p className="text-lg leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">{section.title}</h4>
                        {renderItems(section)}
                    </section>
                ))}
            </main>
        </div>
    );

    // Render selected template
    const renderTemplate = () => {
        switch (templateId) {
            case 'modern': return <ModernClean />;
            case 'professional': return <Professional />;
            case 'creative': return <Creative />;
            case 'executive': return <Executive />;
            case 'minimal': return <Minimal />;
            default: return <ModernClean />;
        }
    };

    return (
        <div ref={ref} className="w-full h-full bg-white print:p-0">
            {renderTemplate()}
        </div>
    );
});

export default TemplateViewer;
