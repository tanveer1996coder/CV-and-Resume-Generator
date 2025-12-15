import React, { forwardRef } from 'react';
import { MapPin, Mail, Phone, Linkedin, Briefcase } from 'lucide-react';

const TemplateViewer = forwardRef(({ data, templateId = 'modern', activeDocument, coverLetterData }, ref) => {

    // Standard Cover Letter Layout
    if (activeDocument === 'coverLetter') {
        return (
            <div ref={ref} className="w-full h-full bg-white shadow-lg p-12 text-gray-800" style={{ minHeight: '1100px' }}>
                {/* Header */}
                <div className="border-b-2 border-gray-800 pb-6 mb-8">
                    <h1 className="text-4xl font-bold uppercase tracking-wide text-gray-900">{data.personalInfo.fullName || 'Your Name'}</h1>
                    <div className="flex gap-4 text-sm mt-3 text-gray-600 font-medium tracking-wide">
                        <span>{data.personalInfo.email}</span>
                        <span>•</span>
                        <span>{data.personalInfo.phone}</span>
                        {data.personalInfo.linkedin && (
                            <>
                                <span>•</span>
                                <span>{data.personalInfo.linkedin}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Recipient Info */}
                <div className="mb-8 text-sm leading-relaxed">
                    <div className="font-bold text-gray-900">{new Date().toLocaleDateString()}</div>
                    <br />
                    <div className="font-bold text-gray-900">{coverLetterData?.recipientName || 'Hiring Manager'}</div>
                    <div className="text-gray-700">{coverLetterData?.recipientTitle}</div>
                    <div className="text-gray-700">{coverLetterData?.companyName}</div>
                    <div className="text-gray-700">{coverLetterData?.companyAddress}</div>
                </div>

                {/* Body */}
                <div className="space-y-4 text-gray-800 leading-7 text-justify">
                    <div className="font-bold">{coverLetterData?.greeting || 'Dear Hiring Manager,'}</div>
                    <div className="whitespace-pre-line min-h-[300px]">
                        {coverLetterData?.body || 'I am writing to express my strong interest in...'}
                    </div>
                </div>

                {/* Sign-off */}
                <div className="mt-8">
                    <div className="mb-4">{coverLetterData?.signOff || 'Sincerely,'}</div>
                    <div className="font-dancing text-2xl text-gray-600 my-2">{data.personalInfo.fullName}</div>
                    <div className="font-bold border-t border-gray-300 w-48 pt-2">{data.personalInfo.fullName}</div>
                </div>
            </div>
        );
    }

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
    };

    // 1. Modern Clean
    const ModernClean = () => (
        <div className="w-full h-full bg-white p-8 font-sans text-gray-800">
            <header className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{data.personalInfo.fullName}</h1>
                    <p className="text-lg text-indigo-600 font-medium mb-4">{data.personalInfo.role}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {data.personalInfo.email && <div className="flex items-center gap-1"><Mail size={14} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-1"><Phone size={14} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.linkedin && <div className="flex items-center gap-1"><Linkedin size={14} /> {data.personalInfo.linkedin}</div>}
                        {data.personalInfo.location && <div className="flex items-center gap-1"><MapPin size={14} /> {data.personalInfo.location}</div>}
                    </div>
                </div>

                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 object-cover border-4 border-gray-200 rounded-lg shadow-sm ml-6" />
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
                    {data.sections.filter(s => s.column === 'main' || (!s.column && s.type === 'experience')).map(section => (
                        <section key={section.id}>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-3">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>

                {/* Sidebar Column */}
                <div className="col-span-4 bg-gray-50 p-4 rounded-lg h-full flex flex-col gap-6">
                    {data.sections.filter(s => s.column === 'sidebar' || (!s.column && s.type !== 'experience')).map(section => (
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
    // 2. Professional (Traditional, Blue accents)
    const Professional = () => (
        <div className="w-full h-full bg-white p-10 font-serif text-gray-900">
            <header className="border-b-4 border-blue-800 pb-6 mb-8 text-center">
                <h1 className="text-5xl font-bold text-blue-900 mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-xl text-gray-600 mb-4">{data.personalInfo.role}</p>
                <div className="flex justify-center gap-6 text-sm">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="space-y-6">
                {data.summary && (
                    <section>
                        <h3 className="text-xl font-bold text-blue-900 border-b border-gray-300 mb-3">Summary</h3>
                        <p className="text-gray-800 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-bold text-blue-900 border-b border-gray-300 mb-3">{section.title}</h3>
                        {renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );
    // 3. Creative (Pink/Purple)
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

    // 4. Executive (Gold/Black)
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
    // 6. Chicago: Classic serif design, traditional resume format
    const Chicago = () => (
        <div className="w-full h-full bg-white p-10 font-serif text-gray-900">
            <header className="border-b border-gray-900 pb-6 mb-8">
                <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-lg text-gray-600 mb-4">{data.personalInfo.role}</p>
                <div className="flex flex-wrap gap-4 text-sm font-sans text-gray-700">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
                    {data.personalInfo.linkedin && <span>• {data.personalInfo.linkedin}</span>}
                </div>
            </header>

            <div className="space-y-8 font-sans">
                {data.summary && (
                    <section>
                        <h3 className="text-xl font-serif font-bold border-b border-gray-400 pb-2 mb-3">Professional Summary</h3>
                        <p className="text-sm leading-relaxed text-gray-800">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-serif font-bold border-b border-gray-400 pb-2 mb-4">{section.title}</h3>
                        {renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );

    // 7. Taj Mahal: Professional two-column with colored sidebar
    const TajMahal = () => (
        <div className="w-full h-full bg-white flex font-sans">
            {/* Left Sidebar - 35% */}
            <div className="w-[35%] bg-gradient-to-b from-blue-900 to-blue-800 text-white p-8 flex flex-col gap-6">
                {data.personalInfo.photo && (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-300 mx-auto">
                        <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-blue-200 text-sm uppercase tracking-wider">{data.personalInfo.role}</p>
                </div>

                <div className="space-y-3 text-sm">
                    {data.personalInfo.email && (
                        <div className="flex items-center gap-2 break-all">
                            <Mail size={16} className="flex-shrink-0" />
                            <span>{data.personalInfo.email}</span>
                        </div>
                    )}
                    {data.personalInfo.phone && (
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="flex-shrink-0" />
                            <span>{data.personalInfo.phone}</span>
                        </div>
                    )}
                    {data.personalInfo.location && (
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="flex-shrink-0" />
                            <span>{data.personalInfo.location}</span>
                        </div>
                    )}
                    {data.personalInfo.linkedin && (
                        <div className="flex items-center gap-2 break-all">
                            <Linkedin size={16} className="flex-shrink-0" />
                            <span>{data.personalInfo.linkedin}</span>
                        </div>
                    )}
                </div>

                <div className="h-px bg-blue-600"></div>

                {/* Sidebar sections (skills, education) */}
                {data.sections.filter(s => s.type === 'skills' || s.type === 'education').map(section => (
                    <section key={section.id}>
                        <h4 className="text-lg font-bold text-blue-100 uppercase mb-3">{section.title}</h4>
                        {section.type === 'education' ? (
                            section.items.map((item, idx) => (
                                <div key={idx} className="mb-3 text-sm">
                                    <div className="font-semibold">{item.degree}</div>
                                    <div className="text-blue-200">{item.institution}</div>
                                    <div className="text-blue-300 text-xs">{item.year}</div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {section.items.map((item, idx) => (
                                    <span key={idx} className="bg-blue-700 px-2 py-1 rounded text-xs">
                                        {typeof item === 'string' ? item : item.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {/* Right Content - 65% */}
            <div className="w-[65%] p-10 flex flex-col gap-8">
                {data.summary && (
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-blue-900 pb-2">Profile</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education').map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-blue-900 pb-2">{section.title}</h3>
                        {renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );

    // 8. Windsor: Elegant with timeline visualization
    const Windsor = () => (
        <div className="w-full h-full bg-white p-10 font-sans text-gray-900">
            <header className="text-center mb-10 pb-8 border-b-4 border-double border-purple-300">
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-purple-200 shadow-lg" />
                )}
                <h1 className="text-5xl font-serif font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-xl text-purple-600 italic mb-4">{data.personalInfo.role}</p>
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>• {data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>• {data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-10">
                {/* Main content - 2 columns */}
                <div className="col-span-2 space-y-8">
                    {data.summary && (
                        <section>
                            <h3 className="text-xl font-serif font-bold text-purple-800 mb-3">Professional Summary</h3>
                            <p className="text-sm leading-relaxed text-gray-700 border-l-4 border-purple-300 pl-4 py-2">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type === 'experience').map(section => (
                        <section key={section.id}>
                            <h3 className="text-xl font-serif font-bold text-purple-800 mb-6">{section.title}</h3>
                            {/* Timeline visualization */}
                            <div className="relative border-l-4 border-purple-200 ml-4 space-y-8 pl-8">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="relative">
                                        <span className="absolute -left-[42px] top-1 w-6 h-6 rounded-full bg-purple-600 border-4 border-white shadow-md"></span>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h4 className="text-lg font-bold text-gray-900">{item.position}</h4>
                                            <span className="text-sm text-purple-600 font-semibold whitespace-nowrap ml-4">{item.duration}</span>
                                        </div>
                                        <p className="text-gray-700 font-semibold mb-2">{item.company}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-8">
                    {data.sections.filter(s => s.type !== 'experience').map(section => (
                        <section key={section.id}>
                            <h4 className="text-lg font-serif font-bold text-purple-800 mb-3 pb-2 border-b-2 border-purple-200">{section.title}</h4>
                            {section.type === 'skills' || section.type === 'list' ? (
                                <div className="space-y-2">
                                    {section.items.map((item, idx) => (
                                        <div key={idx} className="bg-purple-50 border-l-4 border-purple-400 px-3 py-2 text-sm font-medium text-gray-800">
                                            {typeof item === 'string' ? item : item.name}
                                        </div>
                                    ))}
                                </div>
                            ) : section.type === 'education' ? (
                                section.items.map((item, idx) => (
                                    <div key={idx} className="mb-4 text-sm">
                                        <div className="font-bold text-gray-900">{item.degree}</div>
                                        <div className="text-gray-700">{item.institution}</div>
                                        <div className="text-purple-600 font-semibold">{item.year}</div>
                                    </div>
                                ))
                            ) : renderItems(section)}
                        </section>
                    ))}
                </div>
                <p className="text-xl text-slate-300 font-medium mb-6">{data.personalInfo.role}</p>

                <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                    {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={16} className="text-slate-500" /> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={16} className="text-slate-500" /> {data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-500" /> {data.personalInfo.location}</div>}
                    {data.personalInfo.linkedin && <div className="flex items-center gap-2"><Linkedin size={16} className="text-slate-500" /> {data.personalInfo.linkedin}</div>}
                </div>
            </div>

            {/* Photo positioned absolutely */}
            {data.personalInfo.photo && (
                <div className="absolute top-8 right-12 w-40 h-40 bg-white p-2 rounded-lg shadow-xl">
                    <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover rounded" />
                </div>
            )}
        </div>
    );
    // 7. Template 1: Simple Clean (Minimalist)
    const Template1 = () => (
        <div className="w-full h-full bg-white p-12 font-sans text-gray-800">
            <header className="border-b-2 border-gray-800 pb-8 mb-8">
                <h1 className="text-4xl font-bold uppercase tracking-widest">{data.personalInfo.fullName}</h1>
                <p className="text-lg text-gray-500 mt-2">{data.personalInfo.role}</p>
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
            </header>
            <div className="space-y-6">
                {data.summary && <p className="leading-relaxed text-gray-700">{data.summary}</p>}
                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="font-bold text-xl uppercase mb-4 text-gray-900">{section.title}</h3>
                        <div className="space-y-4">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 8. Template 2: Modern Sidebar (Teal)
    const Template2 = () => (
        <div className="w-full h-full flex bg-white font-sans">
            <div className="w-1/3 bg-teal-50 p-8 border-r border-teal-100">
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-6 object-cover" />
                )}
                <div className="space-y-6 text-sm">
                    <div className="space-y-2">
                        {data.personalInfo.email && <div className="flex items-center gap-2 text-teal-800"><Mail size={14} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-2 text-teal-800"><Phone size={14} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className="flex items-center gap-2 text-teal-800"><MapPin size={14} /> {data.personalInfo.location}</div>}
                    </div>
                    {data.sections.filter(s => s.type !== 'experience').map(section => (
                        <div key={section.id}>
                            <h4 className="font-bold text-teal-900 uppercase mb-3 border-b border-teal-200 pb-1">{section.title}</h4>
                            {renderItems(section)}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 p-10">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-teal-900">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-teal-600 font-medium">{data.personalInfo.role}</p>
                </header>
                {data.summary && <p className="mb-8 text-gray-600">{data.summary}</p>}
                <div className="space-y-8">
                    {data.sections.filter(s => s.type === 'experience').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-2xl text-teal-800 mb-4">{section.title}</h3>
                            <div className="space-y-6">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
    // 9. Template 3: Classic Serif (Academic/Traditional) - Top Centered Header
    const Template3 = () => (
        <div className="w-full h-full bg-white p-12 font-serif text-gray-900 border-t-8 border-gray-900">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-3">{data.personalInfo.fullName}</h1>
                <p className="text-lg italic text-gray-600 mb-4">{data.personalInfo.role}</p>

                <div className="flex justify-center flex-wrap gap-6 text-sm font-sans border-t border-b border-gray-300 py-3">
                    {data.personalInfo.email && <span className="flex items-center gap-1"><Mail size={14} /> {data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span className="flex items-center gap-1"><Phone size={14} /> {data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span className="flex items-center gap-1"><MapPin size={14} /> {data.personalInfo.location}</span>}
                    {data.personalInfo.linkedin && <span className="flex items-center gap-1"><Linkedin size={14} /> {data.personalInfo.linkedin}</span>}
                </div>
            </header>

            <div className="space-y-8">
                {data.summary && (
                    <section>
                        <h3 className="text-lg font-bold uppercase border-b-2 border-gray-900 pb-1 mb-3">Professional Summary</h3>
                        <p className="text-gray-800 leading-relaxed text-justify">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="text-lg font-bold uppercase border-b-2 border-gray-900 pb-1 mb-4">{section.title}</h3>
                        {renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );
    // 10. Template 4: Bold Modern - Dark Header Block
    const Template4 = () => (
        <div className="w-full h-full bg-slate-50 font-sans text-gray-800">
            <header className="bg-slate-900 text-white p-12 flex justify-between items-center shadow-lg">
                <div>
                    <h1 className="text-5xl font-bold tracking-tight mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-emerald-400 font-medium">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-sm text-slate-300 space-y-1">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                    {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
                </div>
            </header>

            <div className="p-12 grid grid-cols-12 gap-10">
                {/* Left (Main) Column - 2/3 */}
                <div className="col-span-8 space-y-10">
                    {data.summary && (
                        <section>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 border-l-8 border-emerald-500 pl-4">About Me</h3>
                            <p className="text-lg leading-relaxed text-slate-600">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 border-l-8 border-emerald-500 pl-4">{section.title}</h3>
                            <div className="pl-6 border-l border-slate-200 ml-2 space-y-6">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Right (Sidebar) Column - 1/3 */}
                <div className="col-span-4 space-y-10">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
    // 11. Template 5: Isabella (Ultra Minimalist)
    const Template5 = () => (
        <div className="w-full h-full bg-white p-16 font-sans text-gray-800">
            <header className="mb-16">
                <h1 className="text-6xl font-light tracking-tight text-gray-900 mb-4">{data.personalInfo.fullName}</h1>
                <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                    <p className="text-xl text-gray-500 font-light">{data.personalInfo.role}</p>
                    <div className="flex gap-6 text-sm text-gray-400 font-medium lowercase">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-16">
                {/* Left (Profile & Skills) - 1/3 */}
                <div className="col-span-4 space-y-12">
                    {data.summary && (
                        <section>
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Profile</h4>
                            <p className="text-sm leading-7 text-gray-600 font-light text-justify">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">{section.title}</h4>
                            <div className="text-sm text-gray-600 font-light leading-7">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Right (Experience) - 2/3 */}
                <div className="col-span-8 space-y-12">
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">{section.title}</h4>
                            <div className="space-y-8">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 12. Template 6: Modern Split (Teal/Gray)
    const Template6 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800 flex">
            {/* Left Sidebar - 30% */}
            <div className="w-[30%] bg-teal-900 text-teal-50 p-6 flex flex-col gap-6">
                <div className="text-center">
                    {data.personalInfo.photo && (
                        <img src={data.personalInfo.photo} alt="Profile" className="w-28 h-28 rounded-full mx-auto mb-4 border-2 border-teal-500" />
                    )}
                    <h1 className="text-2xl font-bold text-white mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-teal-300 text-sm uppercase tracking-wider">{data.personalInfo.role}</p>
                </div>

                <div className="space-y-3 text-xs opacity-90">
                    {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={12} /> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={12} /> {data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={12} /> {data.personalInfo.location}</div>}
                </div>

                {data.sections.filter(s => s.type === 'skills' || s.type === 'education').map(section => (
                    <section key={section.id}>
                        <h4 className="text-sm font-bold text-teal-400 uppercase mb-3 border-b border-teal-800 pb-1">{section.title}</h4>
                        {section.type === 'education' ? (
                            section.items.map((item, idx) => (
                                <div key={idx} className="mb-3 text-xs">
                                    <div className="font-bold text-white">{item.degree}</div>
                                    <div className="text-teal-200">{item.institution}</div>
                                    <div className="text-teal-400">{item.year}</div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                {section.items.map((item, idx) => (
                                    <span key={idx} className="bg-teal-800 px-2 py-1 rounded text-[10px] text-teal-100">
                                        {typeof item === 'string' ? item : item.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {/* Right Content - 70% */}
            <div className="w-[70%] p-8 space-y-8 bg-gray-50">
                {data.summary && (
                    <section>
                        <h3 className="text-xl font-bold text-teal-900 mb-3 border-b-2 border-teal-200 pb-1">Profile</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education').map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-bold text-teal-900 mb-4 border-b-2 border-teal-200 pb-1">{section.title}</h3>
                        {renderItems(section)}
                    </section>
                ))}
            </div>
        </div>
    );

    // 13. Template 7: Vertical Timeline (Blue)
    const Template7 = () => (
        <div className="w-full h-full bg-white p-10 font-sans text-gray-800">
            <header className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {data.personalInfo.fullName.charAt(0)}
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-blue-600 font-medium">{data.personalInfo.role}</p>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 border-l-2 border-gray-100 pl-8 space-y-8">
                    {data.summary && (
                        <section>
                            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-3">About</h3>
                            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6">{section.title}</h3>
                            <div className="space-y-6">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
                <div className="col-span-4 space-y-8 bg-blue-50 p-6 rounded-xl h-fit">
                    <div className="space-y-2 text-sm">
                        {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={14} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={14} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={14} /> {data.personalInfo.location}</div>}
                    </div>
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h4 className="text-blue-800 font-bold uppercase mb-3 text-sm">{section.title}</h4>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 14. Template 8: Glacial Minimal (Cyan/Gray)
    const Template8 = () => (
        <div className="w-full h-full bg-white p-12 font-sans text-gray-600">
            <header className="text-right mb-12 border-r-4 border-cyan-400 pr-6">
                <h1 className="text-5xl font-light text-gray-900 mb-2 uppercase tracking-wide">{data.personalInfo.fullName}</h1>
                <p className="text-xl text-cyan-500 font-medium">{data.personalInfo.role}</p>
            </header>

            <div className="flex gap-10">
                <div className="w-1/4 text-right space-y-8 text-sm">
                    <div className="space-y-2 text-gray-500">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                        {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
                    </div>
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'education').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-gray-800 uppercase mb-2">{section.title}</h4>
                            {section.type === 'skills' ? (
                                <div className="flex flex-col gap-1 items-end">
                                    {section.items.map((item, idx) => (
                                        <span key={idx}>{typeof item === 'string' ? item : item.name}</span>
                                    ))}
                                </div>
                            ) : renderItems(section)}
                        </section>
                    ))}
                </div>

                <div className="w-3/4 space-y-10">
                    {data.summary && (
                        <section>
                            <p className="text-lg font-light text-gray-800 leading-relaxed border-l-2 border-cyan-100 pl-4">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education').map(section => (
                        <section key={section.id}>
                            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                {section.title}
                            </h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 15. Template 9: Compact Grid (Boxed)
    const Template9 = () => (
        <div className="w-full h-full bg-slate-100 p-8 font-sans text-slate-800">
            <header className="bg-white p-6 rounded-t-lg border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{data.personalInfo.fullName}</h1>
                    <p className="text-slate-500 font-medium">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                </div>
            </header>

            <div className="bg-white p-6 rounded-b-lg min-h-[90%] grid grid-cols-2 gap-8">
                <div className="col-span-2">
                    {data.summary && <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded mb-4">{data.summary}</p>}
                </div>

                {data.sections.map((section, idx) => (
                    <section key={section.id} className={`${section.type === 'experience' ? 'col-span-2' : 'col-span-1'} border border-slate-100 p-4 rounded`}>
                        <h3 className="font-bold text-slate-900 uppercase text-sm mb-3 bg-slate-50 inline-block px-2 py-1 rounded">{section.title}</h3>
                        <div className="text-sm">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 16. Template 10: High Contrast (Black/White)
    const Template10 = () => (
        <div className="w-full h-full bg-black text-white p-12 font-sans">
            <header className="border-b-2 border-white pb-8 mb-10">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">{data.personalInfo.fullName}</h1>
                <div className="flex justify-between items-end">
                    <p className="text-2xl text-gray-400 font-light">{data.personalInfo.role}</p>
                    <div className="text-right text-sm text-gray-400">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-4 space-y-10 border-r border-gray-800 pr-8">
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'education' || s.type === 'list').map(section => (
                        <section key={section.id}>
                            <h4 className="text-lg font-bold mb-4 text-gray-200">{section.title}</h4>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
                <div className="col-span-8 space-y-10">
                    {data.summary && (
                        <section>
                            <h3 className="text-xl font-bold mb-4">Profile</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education' && s.type !== 'list').map(section => (
                        <section key={section.id}>
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">{section.title}</h3>
                            <div className="text-gray-300">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 17. Template 11: Swiss Clean (Helvetica/Alignment)
    const Template11 = () => (
        <div className="w-full h-full bg-white p-12 font-sans text-gray-900">
            <header className="mb-12">
                <h1 className="text-5xl font-bold tracking-tighter mb-4">{data.personalInfo.fullName}</h1>
                <p className="text-xl text-gray-600 font-medium border-b-4 border-red-600 inline-block pb-1 mb-6">{data.personalInfo.role}</p>
                <div className="flex gap-6 text-sm font-bold text-gray-500">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 space-y-8">
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'education').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-black uppercase text-sm mb-4">{section.title}</h4>
                            <div className="text-sm text-gray-600">
                                {section.type === 'skills' ? (
                                    <div className="flex flex-col gap-2">
                                        {section.items.map((item, idx) => (
                                            <span key={idx} className="font-medium">{typeof item === 'string' ? item : item.name}</span>
                                        ))}
                                    </div>
                                ) : renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
                <div className="col-span-3 space-y-10">
                    {data.summary && (
                        <section>
                            <h3 className="font-bold text-black uppercase text-sm mb-4">Profile</h3>
                            <p className="text-lg leading-tight font-medium text-gray-700">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-black uppercase text-sm mb-6">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 18. Template 12: Warm Serif (Beige/Elegant)
    const Template12 = () => (
        <div className="w-full h-full bg-stone-50 p-14 font-serif text-stone-800">
            <header className="text-center mb-14">
                <h1 className="text-4xl italic font-bold text-stone-900 mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-stone-500 uppercase tracking-widest text-sm mb-6">{data.personalInfo.role}</p>
                <div className="flex justify-center gap-6 text-stone-600 text-sm italic">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
                <div className="w-24 h-px bg-stone-300 mx-auto mt-8"></div>
            </header>

            <div className="space-y-10 px-8">
                {data.summary && (
                    <section className="text-center">
                        <p className="text-lg leading-relaxed text-stone-700">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-bold text-stone-900 text-center mb-6 uppercase tracking-wider">{section.title}</h3>
                        <div className="border-l border-stone-300 pl-6 ml-4">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 19. Template 13: Tech Dark (Terminal/Developer)
    const Template13 = () => (
        <div className="w-full h-full bg-gray-900 text-gray-300 p-10 font-mono text-sm leading-relaxed">
            <header className="mb-10 border-b border-gray-700 pb-6">
                <h1 className="text-green-400 text-3xl font-bold mb-2">{`> ${data.personalInfo.fullName}`}</h1>
                <p className="text-gray-500 mb-4">{`// ${data.personalInfo.role}`}</p>
                <div className="text-xs text-blue-400 flex gap-4">
                    {data.personalInfo.email && <span>{`<${data.personalInfo.email}>`}</span>}
                    {data.personalInfo.phone && <span>{`"${data.personalInfo.phone}"`}</span>}
                    {data.personalInfo.location && <span>{`@${data.personalInfo.location}`}</span>}
                    {data.personalInfo.linkedin && <span>{`link:${data.personalInfo.linkedin}`}</span>}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-purple-400 font-bold mb-4">{`const ${section.title} = [`}</h3>
                            <div className="pl-4 border-l border-gray-800 space-y-6">
                                {renderItems(section)}
                            </div>
                            <div className="text-purple-400 mt-2">{`];`}</div>
                        </section>
                    ))}
                </div>
                <div className="col-span-4 space-y-8">
                    {data.summary && (
                        <section>
                            <h3 className="text-purple-400 font-bold mb-2">summary()</h3>
                            <p className="text-gray-400 text-xs">{`/* ${data.summary} */`}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-purple-400 font-bold mb-2">{`${section.title}.json`}</h3>
                            <div className="bg-gray-800 p-3 rounded text-xs text-green-300">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 20. Template 14: Centered Bold (Symmetrical)
    const Template14 = () => (
        <div className="w-full h-full bg-white p-12 font-sans text-gray-800">
            <header className="flex flex-col items-center mb-12 bg-slate-900 text-white p-8 rounded-xl shadow-lg">
                <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-lg text-slate-300 font-medium mb-4">{data.personalInfo.role}</p>
                <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="space-y-12 max-w-3xl mx-auto text-center">
                {data.summary && (
                    <section>
                        <h3 className="inline-block px-4 py-1 bg-slate-100 text-slate-900 font-bold rounded-full mb-4 uppercase text-xs tracking-wider">Profile</h3>
                        <p className="text-slate-600 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                {data.sections.map(section => (
                    <section key={section.id}>
                        <h3 className="inline-block px-4 py-1 bg-slate-100 text-slate-900 font-bold rounded-full mb-6 uppercase text-xs tracking-wider">{section.title}</h3>
                        <div className="text-left space-y-6">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 21. Template 15: Corporate Blue (Professional Color)
    const Template15 = () => (
        <div className="w-full h-full bg-white font-sans">
            <header className="bg-blue-800 text-white p-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-1">{data.personalInfo.fullName}</h1>
                        <p className="text-xl text-blue-200">{data.personalInfo.role}</p>
                    </div>
                    <div className="text-right text-sm text-blue-100 space-y-1">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                        {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
                    </div>
                </div>
            </header>

            <div className="p-10 grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                    {data.summary && (
                        <section>
                            <h3 className="text-lg font-bold text-blue-800 border-b border-blue-100 pb-2 mb-3 uppercase text-sm">Professional Profile</h3>
                            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-lg font-bold text-blue-800 border-b border-blue-100 pb-2 mb-4 uppercase text-sm">{section.title}</h3>
                            <div className="space-y-6">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-4 space-y-8 bg-blue-50 p-6 -my-10 py-10">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-lg font-bold text-blue-800 mb-4 uppercase text-sm">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 22. Template 16: Geometric Modern (Shapes/Diagonal)
    const Template16 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-50 rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10 p-12 h-full flex flex-col">
                <header className="mb-10">
                    <h1 className="text-5xl font-black text-rose-900 mb-2 uppercase tracking-tighter">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-rose-500 font-bold">{data.personalInfo.role}</p>
                </header>

                <div className="flex-grow grid grid-cols-12 gap-8">
                    <div className="col-span-4 space-y-10 border-r-4 border-rose-100 pr-8">
                        <div className="space-y-3 text-sm font-medium text-rose-800">
                            {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={16} /> {data.personalInfo.email}</div>}
                            {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={16} /> {data.personalInfo.phone}</div>}
                            {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={16} /> {data.personalInfo.location}</div>}
                        </div>

                        {data.sections.filter(s => s.type === 'skills' || s.type === 'education').map(section => (
                            <section key={section.id}>
                                <h4 className="text-xl font-black text-rose-900 mb-4">{section.title}</h4>
                                {section.type === 'skills' ? (
                                    <div className="flex flex-wrap gap-2">
                                        {section.items.map((item, idx) => (
                                            <span key={idx} className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                {typeof item === 'string' ? item : item.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : renderItems(section)}
                            </section>
                        ))}
                    </div>

                    <div className="col-span-8 space-y-8 pl-4">
                        {data.summary && (
                            <section className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-rose-50 shadow-sm">
                                <p className="text-lg leading-relaxed text-gray-700">{data.summary}</p>
                            </section>
                        )}

                        {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education').map(section => (
                            <section key={section.id}>
                                <h3 className="text-2xl font-black text-rose-900 mb-6 flex items-center gap-3">
                                    <span className="w-10 h-1 bg-rose-400"></span>
                                    {section.title}
                                </h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 23. Template 17: Compact Sidebar (Efficient)
    const Template17 = () => (
        <div className="w-full h-full bg-white flex font-sans text-gray-800">
            <div className="w-64 bg-slate-100 p-6 flex-shrink-0 flex flex-col gap-6 text-sm border-r border-slate-200">
                <div className="text-center pb-6 border-b border-slate-300">
                    {data.personalInfo.photo && (
                        <img src={data.personalInfo.photo} alt="Profile" className="w-24 h-24 rounded-lg mx-auto mb-3 object-cover shadow-sm" />
                    )}
                    <h2 className="font-bold text-lg leading-tight">{data.personalInfo.fullName}</h2>
                    <p className="text-slate-500 text-xs mt-1">{data.personalInfo.role}</p>
                </div>

                <div className="space-y-2 text-xs truncate">
                    {data.personalInfo.email && <div title={data.personalInfo.email}>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                </div>

                {data.sections.filter(s => s.type === 'skills' || s.type === 'list').map(section => (
                    <section key={section.id}>
                        <h4 className="font-bold text-slate-700 uppercase text-xs mb-3 border-b border-slate-300 pb-1">{section.title}</h4>
                        <div className="flex flex-col gap-1.5">
                            {section.items.map((item, idx) => (
                                <div key={idx} className="bg-white px-2 py-1 rounded border border-slate-200 text-xs">
                                    {typeof item === 'string' ? item : item.name}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <div className="flex-grow p-10 space-y-8">
                {data.summary && (
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">Professional Summary</h3>
                        <p className="text-sm leading-relaxed text-slate-600">{data.summary}</p>
                    </section>
                )}

                {data.sections.filter(s => s.type !== 'skills' && s.type !== 'list').map(section => (
                    <section key={section.id}>
                        <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-800 pb-1 mb-4">{section.title}</h3>
                        <div className="space-y-4">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 24. Template 18: Onyx Professional (Dark Header/Gold)
    const Template18 = () => (
        <div className="w-full h-full bg-white font-serif text-gray-900">
            <header className="bg-neutral-900 text-neutral-100 p-12">
                <div className="flex justify-between items-center border-b border-neutral-700 pb-8 mb-6">
                    <div>
                        <h1 className="text-5xl font-bold tracking-wide text-amber-50">{data.personalInfo.fullName}</h1>
                        <p className="text-xl text-amber-200 mt-2 font-light italic">{data.personalInfo.role}</p>
                    </div>
                    <div className="text-right text-amber-50/60 text-sm space-y-1 font-sans">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                    </div>
                </div>
                {data.summary && <p className="text-neutral-300 font-sans text-lg max-w-4xl">{data.summary}</p>}
            </header>

            <div className="p-12 grid grid-cols-12 gap-10">
                <div className="col-span-8 space-y-10">
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-2xl font-bold text-neutral-800 border-b-4 border-amber-200 pb-2 mb-6 inline-block">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
                <div className="col-span-4 space-y-10 border-l border-neutral-200 pl-8">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-lg font-bold text-neutral-800 uppercase tracking-widest mb-4 text-amber-700">{section.title}</h3>
                            <div className="text-sm font-sans">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 25. Template 19: Creative Splash (Vibrant Header/Footer)
    const Template19 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800 flex flex-col justify-between">
            <header className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-10 clip-path-slant-bottom pb-20">
                <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-white drop-shadow-md">{data.personalInfo.fullName}</h1>
                <p className="text-2xl font-medium text-purple-100">{data.personalInfo.role}</p>
            </header>

            <div className="flex-grow px-10 -mt-8 grid grid-cols-12 gap-8 mb-10">
                <div className="col-span-8 bg-white rounded-t-xl p-8 shadow-xl space-y-10 z-10">
                    {data.summary && (
                        <section>
                            <h3 className="text-purple-600 font-bold uppercase tracking-wider mb-2 text-sm">About Me</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-purple-600 font-bold uppercase tracking-wider mb-6 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                {section.title}
                            </h3>
                            <div className="space-y-8">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-4 space-y-8 pt-12">
                    <section className="bg-purple-50 p-6 rounded-xl">
                        <h3 className="text-purple-800 font-bold mb-4">Contact</h3>
                        <div className="space-y-3 text-sm text-purple-900">
                            {data.personalInfo.email && <div className="break-all font-medium">@{data.personalInfo.email}</div>}
                            {data.personalInfo.phone && <div className="font-medium">#{data.personalInfo.phone}</div>}
                            {data.personalInfo.location && <div className="font-medium">{data.personalInfo.location}</div>}
                        </div>
                    </section>

                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-gray-900 mb-3 border-b-2 border-purple-200 inline-block pb-1">{section.title}</h4>
                            <div className="text-sm">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <footer className="h-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"></footer>
        </div>
    );

    // 26. Template 20: Minimalist Grid (Clean Borders)
    const Template20 = () => (
        <div className="w-full h-full bg-white p-12 font-sans text-xs">
            <header className="grid grid-cols-12 gap-0 border border-black border-b-0">
                <div className="col-span-8 p-8 border-r border-black">
                    <h1 className="text-4xl font-bold uppercase tracking-widest">{data.personalInfo.fullName}</h1>
                    <p className="text-lg mt-2 font-light">{data.personalInfo.role}</p>
                </div>
                <div className="col-span-4 p-8 flex flex-col justify-center space-y-1">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                </div>
            </header>

            <div className="grid grid-cols-12 border border-black min-h-[800px]">
                <div className="col-span-8 border-r border-black">
                    {data.summary && (
                        <section className="p-8 border-b border-black">
                            <h3 className="font-bold uppercase mb-4 tracking-widest">Profile</h3>
                            <p className="leading-relaxed">{data.summary}</p>
                        </section>
                    )}

                    <div className="p-8 space-y-10">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold uppercase mb-6 tracking-widest bg-black text-white inline-block px-2 py-1">{section.title}</h3>
                                <div className="space-y-6">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                <div className="col-span-4 p-8 space-y-10 bg-gray-50">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold uppercase mb-4 tracking-widest border-b border-black pb-2">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 27. Template 21: Gradient Modern (Cyan-Blue Clean)
    const Template21 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800 flex">
            <div className="w-[35%] bg-gradient-to-b from-cyan-600 to-blue-600 text-white p-8 flex flex-col justify-between">
                <div>
                    {data.personalInfo.photo && (
                        <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/30 shadow-lg object-cover" />
                    )}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-2 tracking-tight leading-none">{data.personalInfo.fullName}</h1>
                        <p className="text-blue-100 font-medium uppercase tracking-widest text-xs opacity-90">{data.personalInfo.role}</p>
                    </div>

                    <div className="space-y-4 text-sm font-medium opacity-95">
                        {data.personalInfo.email && <div className="flex items-center gap-3 bg-white/10 p-2 rounded"><Mail size={14} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-3 bg-white/10 p-2 rounded"><Phone size={14} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className="flex items-center gap-3 bg-white/10 p-2 rounded"><MapPin size={14} /> {data.personalInfo.location}</div>}
                    </div>
                </div>

                <div className="mt-10 space-y-8">
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'education').map(section => (
                        <section key={section.id}>
                            <h4 className="text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-2 mb-4 text-blue-100">{section.title}</h4>
                            {section.type === 'skills' ? (
                                <div className="flex flex-wrap gap-2">
                                    {section.items.map((item, idx) => (
                                        <span key={idx} className="bg-white/20 text-white px-3 py-1 rounded text-xs">
                                            {typeof item === 'string' ? item : item.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm space-y-3">
                                    {section.items.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="font-bold">{item.degree}</div>
                                            <div className="text-blue-200 text-xs">{item.institution}, {item.year}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            </div>

            <div className="w-[65%] p-10 bg-slate-50 space-y-10">
                {data.summary && (
                    <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-end gap-2">
                            About
                            <span className="h-1 flex-grow bg-gray-200 rounded"></span>
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{data.summary}</p>
                    </section>
                )}

                {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education').map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-end gap-2">
                            {section.title}
                            <span className="h-1 flex-grow bg-gray-200 rounded"></span>
                        </h3>
                        <div className="space-y-6">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 28. Template 22: Stark Mono (Black & White Minimalist)
    const Template22 = () => (
        <div className="w-full h-full bg-white font-mono text-gray-900 p-12 text-sm">
            <header className="border-b-4 border-black pb-8 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter">{data.personalInfo.fullName}</h1>
                    <p className="text-lg bg-black text-white inline-block px-2 py-0.5 mt-2 font-bold">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-xs space-y-1">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8 pr-4">
                    {data.summary && (
                        <section>
                            <h3 className="font-bold uppercase border-b border-gray-300 pb-1 mb-3">Profile</h3>
                            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold uppercase border-b border-gray-300 pb-1 mb-4 flex justify-between items-center group">
                                {section.title}
                                <span className="text-[10px] text-gray-400 group-hover:text-black transition-colors">See Details</span>
                            </h3>
                            <div className="space-y-6">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-4 space-y-8 pl-4 border-l border-gray-200">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-xs">{section.title}</h3>
                            {renderItems(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 29. Template 23: Nature Fresh (Green/Organic)
    const Template23 = () => (
        <div className="w-full h-full bg-[#fdfdf7] font-sans text-emerald-950 p-10">
            <header className="text-center mb-10">
                <div className="inline-block p-1 border-2 border-emerald-100 rounded-full mb-4">
                    {data.personalInfo.photo && <img src={data.personalInfo.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover" />}
                </div>
                <h1 className="text-4xl font-serif font-medium text-emerald-900 mb-1">{data.personalInfo.fullName}</h1>
                <p className="text-emerald-600 uppercase tracking-widest text-sm mb-4">{data.personalInfo.role}</p>
                <div className="flex justify-center gap-4 text-xs font-medium text-emerald-700/80">
                    {data.personalInfo.email && <span className="bg-emerald-50 px-2 py-1 rounded">{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span className="bg-emerald-50 px-2 py-1 rounded">{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span className="bg-emerald-50 px-2 py-1 rounded">{data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="grid grid-cols-2 gap-10">
                <div className="space-y-8">
                    {data.summary && (
                        <section className="bg-emerald-50/50 p-6 rounded-2xl">
                            <h3 className="font-serif font-bold text-emerald-800 mb-2">About Me</h3>
                            <p className="text-sm leading-relaxed text-emerald-900/80">{data.summary}</p>
                        </section>
                    )}
                    {data.sections.filter((_, i) => i % 2 === 0).map(section => (
                        <section key={section.id}>
                            <h3 className="font-serif font-bold text-xl text-emerald-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                {section.title}
                            </h3>
                            <div className="space-y-4 text-sm">{renderItems(section)}</div>
                        </section>
                    ))}
                </div>
                <div className="space-y-8">
                    {data.sections.filter((_, i) => i % 2 !== 0).map(section => (
                        <section key={section.id}>
                            <h3 className="font-serif font-bold text-xl text-emerald-800 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                {section.title}
                            </h3>
                            <div className="space-y-4 text-sm">{renderItems(section)}</div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 30. Template 24: Tech Minimal (Slate/Clean)
    const Template24 = () => (
        <div className="w-full h-full bg-slate-50 font-sans text-slate-800 p-12">
            <div className="flex gap-8 items-start mb-12">
                <div className="flex-grow">
                    <h1 className="text-5xl font-light text-slate-900 tracking-tight leading-none mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-slate-500 font-medium">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-sm font-medium text-slate-400 space-y-1">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 border-t border-slate-200 pt-10">
                <div className="col-span-3 space-y-8">
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'links' || s.type === 'education').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-4 opacity-40">{section.title}</h4>
                            <div className="text-sm text-slate-600 space-y-2">
                                {section.type === 'skills' ? (
                                    section.items.map((item, idx) => (
                                        <div key={idx} className="border-b border-slate-200 pb-1">{typeof item === 'string' ? item : item.name}</div>
                                    ))
                                ) : renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-9 space-y-12 border-l border-slate-200 pl-8">
                    {data.summary && (
                        <section>
                            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-4 opacity-40">Profile</h3>
                            <p className="text-lg font-light leading-relaxed text-slate-700">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type !== 'skills' && s.type !== 'links' && s.type !== 'education').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-6 opacity-40">{section.title}</h3>
                            <div className="space-y-8">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 31. Template 25: Executive Serif (Gold/Navy Traditional)
    const Template25 = () => (
        <div className="w-full h-full bg-white font-serif text-gray-900 border-t-8 border-sky-900">
            <header className="px-12 py-10 border-b border-gray-200 bg-gray-50/50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-sky-950 mb-3 tracking-wide">{data.personalInfo.fullName}</h1>
                    <p className="text-sm font-sans uppercase tracking-[0.2em] text-amber-600 font-bold mb-6">{data.personalInfo.role}</p>

                    <div className="flex justify-center gap-8 font-sans text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                    </div>
                </div>
            </header>

            <div className="p-12 space-y-10">
                {data.summary && (
                    <section className="text-center max-w-2xl mx-auto">
                        <p className="text-lg text-gray-700 leading-relaxed italic border-l-2 border-r-2 border-amber-500/30 px-6 py-2">{data.summary}</p>
                    </section>
                )}

                <div className="grid grid-cols-12 gap-10 pt-4">
                    <div className="col-span-8 space-y-10">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-2">
                                    <h3 className="text-xl font-bold text-sky-950 uppercase tracking-widest">{section.title}</h3>
                                    <span className="flex-grow h-px bg-gray-100"></span>
                                </div>
                                <div className="space-y-8 pl-2">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="col-span-4 bg-sky-50/50 p-6 rounded border border-sky-100 h-fit space-y-8">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h4 className="font-bold text-sky-900 uppercase tracking-widest text-xs mb-4 border-b border-sky-200 pb-2">{section.title}</h4>
                                <div className="font-sans text-sm text-gray-700">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 32. Template 26: Clean Professional (Sidebar Timeline)
    const Template26 = () => (
        <div className="w-full h-full bg-white flex font-sans text-gray-800">
            <div className="w-[30%] bg-slate-900 text-slate-100 p-8 flex flex-col justify-between">
                <div>
                    {data.personalInfo.photo && (
                        <img src={data.personalInfo.photo} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-slate-700 object-cover" />
                    )}
                    <h1 className="text-2xl font-bold text-center mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-center text-slate-400 text-sm uppercase tracking-wider mb-8">{data.personalInfo.role}</p>

                    <div className="space-y-4 text-sm text-slate-300">
                        {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={14} /> {data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={14} /> {data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={14} /> {data.personalInfo.location}</div>}
                    </div>
                </div>

                <div className="space-y-8 mt-10">
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'links').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-slate-100 uppercase tracking-widest text-xs mb-4 border-b border-slate-700 pb-2">{section.title}</h4>
                            <div className="space-y-2 text-sm text-slate-300">
                                {section.type === 'skills' ? (
                                    <div className="flex flex-wrap gap-2">
                                        {section.items.map((item, idx) => (
                                            <span key={idx} className="bg-slate-800 px-2 py-1 rounded text-xs">{typeof item === 'string' ? item : item.name}</span>
                                        ))}
                                    </div>
                                ) : renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>

            <div className="w-[70%] p-10 bg-white">
                {data.summary && (
                    <section className="mb-10 p-6 bg-slate-50 rounded-lg border-l-4 border-slate-900">
                        <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm mb-2">Professional Summary</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{data.summary}</p>
                    </section>
                )}

                {data.sections.filter(s => s.type !== 'skills' && s.type !== 'links').map(section => (
                    <section key={section.id} className="mb-8">
                        <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-slate-900"></span>
                            {section.title}
                        </h3>
                        <div className="space-y-8 border-l-2 border-slate-100 ml-4 pl-6 relative">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 33. Template 27: Pink Minimalist (Soft/Clean)
    const Template27 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-700 p-12">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-thin text-rose-950 mb-3 tracking-wide">{data.personalInfo.fullName}</h1>
                <p className="text-rose-400 uppercase tracking-[0.3em] text-sm font-medium">{data.personalInfo.role}</p>
                <div className="flex justify-center gap-6 mt-6 text-xs text-rose-900/50 uppercase tracking-widest font-medium">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-4 text-right space-y-10 border-r border-rose-100 pr-12">
                    {data.sections.filter(s => s.type === 'skills' || s.type === 'education' || s.type === 'links').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-rose-950 uppercase tracking-widest text-xs mb-4">{section.title}</h4>
                            <div className="text-sm space-y-2">
                                {section.type === 'skills' ? (
                                    section.items.map((item, idx) => (
                                        <div key={idx} className="py-1">{typeof item === 'string' ? item : item.name}</div>
                                    ))
                                ) : renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-8 space-y-10">
                    {data.summary && (
                        <section>
                            <p className="text-lg font-light leading-relaxed text-rose-900/80 italic">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type !== 'skills' && s.type !== 'education' && s.type !== 'links').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-rose-950 uppercase tracking-widest text-sm mb-6 border-b border-rose-100 pb-2">{section.title}</h3>
                            <div className="space-y-6">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 34. Template 28: Elegant Dark (Slate/Gold)
    const Template28 = () => (
        <div className="w-full h-full bg-slate-900 text-slate-300 font-serif">
            <header className="p-12 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl text-amber-500 font-bold tracking-wide">{data.personalInfo.fullName}</h1>
                    <p className="text-lg text-slate-400 mt-2 italic">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-xs font-sans text-slate-500 space-y-1">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                </div>
            </header>

            <div className="p-12">
                {data.summary && (
                    <section className="mb-12 max-w-3xl">
                        <h3 className="text-amber-500 text-xs font-sans font-bold uppercase tracking-widest mb-3">Professional Profile</h3>
                        <p className="text-lg leading-relaxed text-slate-100">{data.summary}</p>
                    </section>
                )}

                <div className="grid grid-cols-12 gap-12">
                    <div className="col-span-8 space-y-12">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="text-2xl text-slate-100 font-bold mb-6 flex items-center gap-4">
                                    {section.title}
                                    <span className="flex-grow h-px bg-slate-800"></span>
                                </h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="col-span-4 space-y-10">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="text-amber-500 text-xs font-sans font-bold uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">{section.title}</h3>
                                <div className="font-sans text-sm">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 35. Template 29: Creative Grid (Boxed)
    const Template29 = () => (
        <div className="w-full h-full bg-gray-100 p-8 font-sans text-gray-800">
            <div className="bg-white p-8 mb-4 shadow rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black text-indigo-600 mb-1">{data.personalInfo.fullName}</h1>
                        <p className="text-xl font-bold text-gray-500">{data.personalInfo.role}</p>
                    </div>
                    <div className="text-right text-sm font-medium text-gray-500 space-y-1">
                        {data.personalInfo.email && <div className="bg-gray-50 px-2 py-1 rounded inline-block ml-2">{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="bg-gray-50 px-2 py-1 rounded inline-block ml-2">{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className="bg-gray-50 px-2 py-1 rounded inline-block ml-2">{data.personalInfo.location}</div>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                    {data.summary && (
                        <div className="bg-white p-6 shadow rounded-lg">
                            <h3 className="font-bold text-gray-400 text-xs uppercase mb-2">Summary</h3>
                            <p className="text-gray-700">{data.summary}</p>
                        </div>
                    )}
                </div>

                <div className="col-span-2 space-y-4">
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <div key={section.id} className="bg-white p-6 shadow rounded-lg">
                            <h3 className="font-bold text-indigo-600 text-lg mb-4 flex items-center gap-2">
                                <span className="p-1 bg-indigo-100 rounded text-indigo-600"><Briefcase size={16} /></span>
                                {section.title}
                            </h3>
                            <div className="space-y-6">
                                {renderItems(section)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-span-1 space-y-4">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <div key={section.id} className="bg-white p-6 shadow rounded-lg">
                            <h3 className="font-bold text-gray-700 text-sm uppercase mb-4">{section.title}</h3>
                            <div className="text-sm space-y-3">
                                {renderItems(section)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // 36. Template 30: Modern Standard (Blue Accents)
    const Template30 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800">
            <header className="bg-blue-600 text-white p-10 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">{data.personalInfo.fullName}</h1>
                    <p className="text-blue-100 text-lg mt-1">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-sm text-blue-50 space-y-1">
                    {data.personalInfo.email && <div className="font-medium">{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="font-medium">{data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className="font-medium">{data.personalInfo.location}</div>}
                </div>
            </header>

            <div className="p-10 space-y-10">
                {data.summary && (
                    <section className="bg-blue-50 p-6 rounded border-l-4 border-blue-600">
                        <h3 className="font-bold text-blue-900 mb-2 text-sm uppercase">About</h3>
                        <p className="text-blue-900/80 leading-relaxed">{data.summary}</p>
                    </section>
                )}

                <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-8 space-y-8">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold text-2xl text-gray-800 border-b-2 border-gray-100 pb-2 mb-6">{section.title}</h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="col-span-4 space-y-8">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold text-lg text-blue-600 mb-4">{section.title}</h3>
                                <div className="text-sm text-gray-600">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 37. Template 31: Sharp Professional (Navy/Gold Angular)
    const Template31 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800">
            <header className="bg-slate-900 text-white p-12 clip-path-polygon-header">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold tracking-wide text-amber-500">{data.personalInfo.fullName}</h1>
                        <p className="text-lg mt-1 text-slate-300 uppercase tracking-widest text-xs font-bold">{data.personalInfo.role}</p>
                    </div>
                    <div className="text-right text-xs text-slate-400 space-y-1">
                        {data.personalInfo.email && <div className="font-medium">{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div className="font-medium">{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div className="font-medium">{data.personalInfo.location}</div>}
                    </div>
                </div>
            </header>

            <div className="p-12 -mt-8">
                <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-8 space-y-10">
                        {data.summary && (
                            <section className="mb-6">
                                <h3 className="text-amber-600 font-bold uppercase text-xs tracking-widest mb-2">Professional Profile</h3>
                                <p className="text-slate-700 leading-relaxed">{data.summary}</p>
                            </section>
                        )}

                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4 mb-6">{section.title}</h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="col-span-4 space-y-8 bg-slate-50 p-6 rounded-lg h-fit border border-slate-100">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4 border-b border-slate-200 pb-2">{section.title}</h3>
                                <div className="text-sm text-slate-600">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 38. Template 32: Soft Modern (Peach/Grey)
    const Template32 = () => (
        <div className="w-full h-full bg-orange-50/30 font-sans text-gray-700 p-12">
            <div className="flex items-center gap-8 mb-12 border-b border-orange-200 pb-8">
                {data.personalInfo.photo && (
                    <img src={data.personalInfo.photo} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-sm" />
                )}
                <div className="flex-grow">
                    <h1 className="text-5xl font-thin text-gray-800 tracking-tight">{data.personalInfo.fullName}</h1>
                    <p className="text-xl text-orange-400 font-medium mt-1">{data.personalInfo.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-8 space-y-10">
                    {data.summary && (
                        <section>
                            <p className="text-lg font-light leading-relaxed text-gray-600 italic border-l-2 border-orange-300 pl-4">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-2xl text-gray-800 mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                {section.title}
                            </h3>
                            <div className="space-y-8">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-4 space-y-8 text-sm">
                    <section>
                        <h4 className="font-bold text-gray-800 mb-3">Contact Details</h4>
                        <div className="space-y-2 text-gray-500">
                            {data.personalInfo.email && <div className="break-all">{data.personalInfo.email}</div>}
                            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                            {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                        </div>
                    </section>

                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h4 className="font-bold text-gray-800 mb-3 border-b-2 border-orange-100 pb-1 inline-block">{section.title}</h4>
                            <div className="space-y-4 text-gray-600">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 39. Template 33: System Tech (Monospace/Terminal)
    const Template33 = () => (
        <div className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-10 text-xs">
            <header className="mb-10 border-b border-[#333] pb-6">
                <h1 className="text-2xl text-[#569cd6] font-bold mb-2">
                    <span className="text-[#ce9178]">const</span> name = <span className="text-[#ce9178]">"{data.personalInfo.fullName}"</span>;
                </h1>
                <p className="text-[#9cdcfe]">
                    <span className="text-[#c586c0]">let</span> role = <span className="text-[#ce9178]">"{data.personalInfo.role}"</span>;
                </p>
                <div className="mt-4 text-[#6a9955] flex gap-4">
                    {data.personalInfo.email && <span>{'//'} {data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{'//'} {data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{'//'} {data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 space-y-8">
                    {data.summary && (
                        <section>
                            <h3 className="text-[#dcdcaa] mb-2">summary() &#123;</h3>
                            <p className="pl-4 text-[#ce9178] border-l border-[#333] italic py-1 opacity-80">{data.summary}</p>
                            <div className="text-[#dcdcaa]">&#125;</div>
                        </section>
                    )}

                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-[#4ec9b0] mb-4 text-sm font-bold">interface {section.title.replace(/\s+/g, '')} &#123;</h3>
                            <div className="pl-4 space-y-6">
                                {renderItems(section)}
                            </div>
                            <div className="text-[#4ec9b0] mt-4">&#125;</div>
                        </section>
                    ))}
                </div>

                <div className="col-span-4 space-y-8 border-l border-[#333] pl-6">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-[#c586c0] mb-3 text-sm font-bold">import {section.title.replace(/\s+/g, '')};</h3>
                            <div className="pl-2">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 40. Template 34: Centered Serif (Classic/Elegant)
    const Template34 = () => (
        <div className="w-full h-full bg-[#fcfbf9] font-serif text-gray-900 border-8 border-double border-gray-200 p-8 m-4 max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)]">
            <header className="text-center mb-12 border-b border-gray-300 pb-8">
                <h1 className="text-4xl uppercase tracking-widest font-bold text-gray-800 mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-6">{data.personalInfo.role}</p>
                <div className="flex justify-center gap-6 text-xs text-gray-500 italic font-sans">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-10">
                {data.summary && (
                    <section className="text-center">
                        <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-gray-400 mb-3">About</h3>
                        <p className="text-lg leading-relaxed text-gray-700">{data.summary}</p>
                    </section>
                )}

                <div className="grid grid-cols-2 gap-12 text-center">
                    <div className="space-y-10">
                        {data.sections.filter((_, i) => i % 2 === 0).map(section => (
                            <section key={section.id}>
                                <h3 className="text-lg font-bold uppercase border-b border-gray-200 pb-2 mb-4 inline-block">{section.title}</h3>
                                <div className="space-y-6 text-left">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div className="space-y-10">
                        {data.sections.filter((_, i) => i % 2 !== 0).map(section => (
                            <section key={section.id}>
                                <h3 className="text-lg font-bold uppercase border-b border-gray-200 pb-2 mb-4 inline-block">{section.title}</h3>
                                <div className="space-y-6 text-left">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 41. Template 35: Bold Creative (Large Type)
    const Template35 = () => (
        <div className="w-full h-full bg-white font-sans text-black">
            <header className="bg-black text-white p-12">
                <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 break-words">{data.personalInfo.fullName}</h1>
                <div className="flex justify-between items-end border-t border-white/20 pt-6">
                    <p className="text-2xl font-bold">{data.personalInfo.role}</p>
                    <div className="text-right text-sm font-mono opacity-70">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    </div>
                </div>
            </header>

            <div className="p-12 grid grid-cols-12 gap-12">
                <div className="col-span-8">
                    {data.summary && (
                        <section className="mb-12">
                            <p className="text-2xl font-bold leading-tight">{data.summary}</p>
                        </section>
                    )}

                    <div className="space-y-12">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="text-4xl font-black uppercase mb-8 border-b-4 border-black inline-block">{section.title}</h3>
                                <div className="space-y-10">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                <div className="col-span-4 space-y-12 border-l-4 border-black pl-8">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-xl font-black uppercase mb-6 bg-black text-white inline-block px-2">{section.title}</h3>
                            <div className="space-y-4 font-medium">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 42. Template 36: Compact Tech (Dense/Small Font)
    const Template36 = () => (
        <div className="w-full h-full bg-white font-mono text-[10px] text-gray-800 leading-tight">
            <header className="flex justify-between items-end border-b-2 border-black pb-2 mb-4 p-4">
                <div>
                    <h1 className="text-xl font-bold uppercase">{data.personalInfo.fullName}</h1>
                    <p className="text-gray-600">{data.personalInfo.role}</p>
                </div>
                <div className="text-right">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                </div>
            </header>

            <div className="grid grid-cols-4 gap-4 px-4">
                <div className="col-span-3 space-y-4">
                    {data.summary && (
                        <div className="border border-gray-300 p-2 rounded">
                            <p>{data.summary}</p>
                        </div>
                    )}

                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <div key={section.id}>
                            <h3 className="font-bold uppercase border-b border-gray-400 mb-2">{section.title}</h3>
                            <div className="space-y-3">
                                {renderItems(section)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-span-1 space-y-4">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <div key={section.id}>
                            <h3 className="font-bold uppercase border-b border-gray-400 mb-2">{section.title}</h3>
                            <div className="space-y-1">
                                {renderItems(section)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // 43. Template 37: Creative Right (Sidebar Right)
    const Template37 = () => (
        <div className="w-full h-full bg-white font-sans flex text-gray-800">
            <div className="w-[65%] p-10 space-y-10">
                <header>
                    <h1 className="text-4xl font-light text-purple-900 mb-1">{data.personalInfo.fullName}</h1>
                    <p className="text-purple-500 uppercase tracking-widest text-sm font-bold">{data.personalInfo.role}</p>
                    {data.summary && <p className="mt-6 text-gray-600 leading-relaxed">{data.summary}</p>}
                </header>

                {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                    <section key={section.id}>
                        <h3 className="text-xl font-bold text-purple-900 mb-4">{section.title}</h3>
                        <div className="space-y-8 border-l-2 border-purple-100 pl-4">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>

            <div className="w-[35%] bg-purple-50 p-10 text-sm space-y-10 border-l border-purple-100">
                <div className="space-y-2 text-purple-900/70 font-medium">
                    {data.personalInfo.email && <div className="flex items-center gap-2"><Mail size={12} /> {data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div className="flex items-center gap-2"><Phone size={12} /> {data.personalInfo.phone}</div>}
                    {data.personalInfo.location && <div className="flex items-center gap-2"><MapPin size={12} /> {data.personalInfo.location}</div>}
                </div>

                {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                    <section key={section.id}>
                        <h3 className="font-bold text-purple-900 uppercase tracking-widest text-xs mb-4 border-b border-purple-200 pb-2">{section.title}</h3>
                        <div className="space-y-3">
                            {renderItems(section)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );

    // 44. Template 38: Split Minimal (50/50)
    const Template38 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-800 flex">
            <div className="w-1/2 p-12 bg-gray-50 flex flex-col justify-center text-right border-r border-gray-200">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{data.personalInfo.fullName}</h1>
                <p className="text-gray-500 font-medium mb-8">{data.personalInfo.role}</p>

                <div className="space-y-8">
                    {data.summary && <p className="text-sm text-gray-600 leading-relaxed italic">{data.summary}</p>}

                    <div className="text-xs text-gray-400 space-y-1">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
                    </div>

                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <div key={section.id}>
                            <h4 className="font-bold uppercase text-xs mb-3 text-gray-900">{section.title}</h4>
                            <div className="text-sm text-gray-600">
                                {renderItems(section)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-1/2 p-12 overflow-hidden">
                <div className="space-y-10">
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-xl uppercase mb-6 text-gray-900 decoration-4 decoration-gray-200 underline underline-offset-4">{section.title}</h3>
                            <div className="space-y-8">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 45. Template 39: Magazine Editorial (Big Headers)
    const Template39 = () => (
        <div className="w-full h-full bg-[#f8f5f2] font-serif text-gray-900 p-16">
            <header className="border-b-4 border-black pb-8 mb-12">
                <h1 className="text-6xl font-bold italic tracking-tighter mb-2">{data.personalInfo.fullName}</h1>
                <div className="flex justify-between text-sm font-sans uppercase tracking-widest font-bold">
                    <span>{data.personalInfo.role}</span>
                    <span>{data.personalInfo.location}</span>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-12">
                <div className="col-span-1 border-r border-gray-300 pr-8 font-sans">
                    <div className="mb-8 text-xs font-bold uppercase tracking-widest space-y-1">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    </div>

                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id} className="mb-8">
                            <h3 className="font-black text-lg mb-3">{section.title}</h3>
                            <div className="text-sm space-y-2">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-2 space-y-10">
                    {data.summary && (
                        <section>
                            <p className="text-xl font-light italic leading-relaxed">{data.summary}</p>
                        </section>
                    )}

                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="font-black text-3xl mb-6 font-sans uppercase">{section.title}</h3>
                            <div className="space-y-8">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 46. Template 40: Corporate Grey (Super Safe)
    const Template40 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-700">
            <header className="bg-gray-100 p-10 border-b border-gray-200">
                <h1 className="text-3xl font-semibold text-gray-900">{data.personalInfo.fullName}</h1>
                <p className="text-lg text-gray-600 mb-4">{data.personalInfo.role}</p>
                <div className="flex gap-6 text-sm text-gray-500">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
                </div>
            </header>

            <div className="p-10">
                {data.summary && (
                    <section className="mb-10">
                        <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2">Profile</h3>
                        <p className="max-w-4xl text-gray-600">{data.summary}</p>
                    </section>
                )}

                <div className="space-y-10">
                    {data.sections.map(section => (
                        <section key={section.id}>
                            <h3 className="font-bold text-xl text-gray-800 border-b border-gray-200 pb-2 mb-6">{section.title}</h3>
                            <div className={section.type === 'skills' ? 'flex flex-wrap gap-x-8 gap-y-2' : 'space-y-6'}>
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 47. Template 41: Vibrant Cards (Colorful Grid)
    const Template41 = () => (
        <div className="w-full h-full bg-slate-50 font-sans p-8">
            <header className="bg-gradient-to-r from-pink-500 to-violet-600 text-white p-6 rounded-xl shadow-lg mb-8">
                <h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1>
                <p className="opacity-90">{data.personalInfo.role}</p>
                <div className="flex gap-4 text-xs mt-4 opacity-80 font-mono">
                    {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                </div>
            </header>

            <div className="grid grid-cols-2 gap-6">
                {data.summary && (
                    <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="text-violet-600 font-bold uppercase text-xs mb-2">About Me</h3>
                        <p className="text-slate-600 text-sm">{data.summary}</p>
                    </div>
                )}

                {data.sections.map(section => (
                    <div key={section.id} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 ${section.type === 'experience' ? 'col-span-2' : 'col-span-1'}`}>
                        <h3 className="text-violet-600 font-bold text-lg mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                            {section.title}
                        </h3>
                        <div className="space-y-4 text-sm text-slate-700">
                            {renderItems(section)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 48. Template 42: Abstract Header (Artistic)
    const Template42 = () => (
        <div className="w-full h-full bg-white font-sans overflow-hidden">
            <div className="h-48 bg-gray-900 relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full -mr-32 -mt-32 mix-blend-exclusion"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 rounded-full -ml-20 -mb-20 mix-blend-exclusion"></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col text-white z-10">
                    <h1 className="text-4xl font-black uppercase tracking-widest">{data.personalInfo.fullName}</h1>
                    <p className="text-sm font-light tracking-[0.5em] mt-2">{data.personalInfo.role}</p>
                </div>
            </div>

            <div className="p-12">
                <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-4 border-r-2 border-gray-100 pr-8 text-right space-y-8">
                        <div className="space-y-1 text-xs font-bold text-gray-400 uppercase">
                            {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                        </div>

                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-black text-gray-900 mb-3 uppercase">{section.title}</h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="col-span-8 space-y-8">
                        {data.summary && (
                            <p className="text-lg text-gray-500 font-light leading-relaxed">{data.summary}</p>
                        )}
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-black text-2xl text-gray-900 mb-6 uppercase border-b border-gray-100 pb-2">{section.title}</h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 49. Template 43: Tech Timeline (Dot connected)
    const Template43 = () => (
        <div className="w-full h-full bg-[#0f172a] text-slate-300 font-sans p-10">
            <header className="flex items-center justify-between border-b border-slate-800 pb-8 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-400">{data.personalInfo.fullName}</h1>
                    <p className="text-slate-500">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-xs font-mono text-cyan-500/70">
                    {data.personalInfo.email && <div>&lt;{data.personalInfo.email} /&gt;</div>}
                    {data.personalInfo.phone && <div>&lt;{data.personalInfo.phone} /&gt;</div>}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-8">
                    {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                        <section key={section.id}>
                            <h3 className="text-cyan-400 font-mono text-lg mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></span>
                                {section.title}
                            </h3>
                            <div className="space-y-8 border-l border-slate-800 ml-1.5 pl-6 relative">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="col-span-1 space-y-8">
                    {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                        <section key={section.id} className="bg-slate-900/50 p-4 rounded border border-slate-800">
                            <h3 className="text-cyan-400 font-mono text-sm mb-4">{section.title}</h3>
                            <div className="text-sm">
                                {renderItems(section)}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );

    // 50. Template 44: Clean Cards (Soft Shadows)
    const Template44 = () => (
        <div className="w-full h-full bg-gray-50 font-sans p-10 text-gray-700">
            <header className="bg-white p-8 rounded-2xl shadow-sm mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
                    <p className="text-indigo-500 font-medium">{data.personalInfo.role}</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                </div>
            </header>

            <div className="space-y-6">
                {data.summary && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Profile</h3>
                        <p className="leading-relaxed">{data.summary}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    {data.sections.map(section => (
                        <div key={section.id} className={`bg-white p-6 rounded-2xl shadow-sm ${section.type === 'experience' ? 'col-span-2' : 'col-span-1'}`}>
                            <h3 className="font-bold text-gray-800 text-lg mb-4 pb-2 border-b border-gray-100">{section.title}</h3>
                            <div className="space-y-4">
                                {renderItems(section)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // 51. Template 45: Gradient Border (Trendy)
    const Template45 = () => (
        <div className="w-full h-full bg-white font-sans p-2">
            <div className="w-full h-full border-4 border-transparent bg-clip-padding rounded-xl p-8 relative" style={{ backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #6366f1, #a855f7, #ec4899)', backgroundOrigin: 'border-box', backgroundClip: 'content-box, border-box' }}>
                <header className="text-center mb-10">
                    <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-2">{data.personalInfo.fullName}</h1>
                    <p className="text-gray-500 uppercase tracking-widest font-bold text-xs">{data.personalInfo.role}</p>
                    <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-gray-400">
                        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8 text-gray-700">
                    <div className="col-span-4 text-right space-y-8">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold text-indigo-600 uppercase text-sm mb-2">{section.title}</h3>
                                <div className="text-sm">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="col-span-8 space-y-8 border-l border-gray-100 pl-8">
                        {data.summary && (
                            <p className="italic text-gray-500 text-lg mb-8">{data.summary}</p>
                        )}
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold text-2xl text-gray-800 mb-6">{section.title}</h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 52. Template 46: High Contrast (Yellow/Black)
    const Template46 = () => (
        <div className="w-full h-full bg-yellow-400 font-sans text-black p-8">
            <div className="bg-white w-full h-full p-10 shadow-2xl skew-x-1 origin-top-left">
                <header className="flex justify-between items-start border-b-8 border-black pb-8 mb-8">
                    <div>
                        <h1 className="text-5xl font-black italic uppercase">{data.personalInfo.fullName}</h1>
                        <p className="text-xl font-bold bg-black text-yellow-400 inline-block px-2 mt-2">{data.personalInfo.role}</p>
                    </div>
                    <div className="text-right font-mono text-sm font-bold">
                        {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                        {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-10">
                    <div className="col-span-2 space-y-8">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-black text-3xl uppercase mb-6 decoration-8 decoration-yellow-400 underline underline-offset-4">{section.title}</h3>
                                <div className="space-y-8">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div className="col-span-1 space-y-8">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-black text-xl uppercase mb-4 bg-black text-white p-1">{section.title}</h3>
                                <div className="font-bold border-l-4 border-yellow-400 pl-4">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 53. Template 47: Swiss Style (Helvetica/Grid)
    const Template47 = () => (
        <div className="w-full h-full bg-white font-sans text-gray-900 p-12">
            <header className="mb-16 grid grid-cols-12">
                <div className="col-span-8">
                    <h1 className="text-6xl font-black tracking-tight leading-none">{data.personalInfo.fullName}</h1>
                </div>
                <div className="col-span-4 text-right pt-2 border-t-4 border-black">
                    <p className="text-xl font-bold">{data.personalInfo.role}</p>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-x-12 gap-y-16">
                {data.summary && (
                    <div className="col-span-6 text-xl leading-tight font-medium">
                        {data.summary}
                    </div>
                )}
                <div className="col-span-6 flex flex-col justify-end text-sm font-bold">
                    {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
                    {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
                </div>

                {data.sections.map((section, idx) => (
                    <div key={section.id} className={`border-t-2 border-gray-200 pt-4 ${section.type === 'experience' ? 'col-span-8' : 'col-span-4'}`}>
                        <h3 className="font-bold uppercase text-xs mb-4">{section.title}</h3>
                        <div className="space-y-4">
                            {renderItems(section)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 54. Template 48: Rounded Modern (Soft UI)
    const Template48 = () => (
        <div className="w-full h-full bg-slate-100 font-sans p-8 text-slate-700">
            <div className="bg-white w-full h-full rounded-[3rem] p-12 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-sky-100"></div>

                <header className="relative z-10 flex gap-8 mb-12">
                    {data.personalInfo.photo && (
                        <img src={data.personalInfo.photo} alt="Profile" className="w-40 h-40 rounded-full border-8 border-white shadow-sm object-cover" />
                    )}
                    <div className="pt-8">
                        <h1 className="text-4xl font-bold text-slate-800">{data.personalInfo.fullName}</h1>
                        <p className="text-xl text-sky-500 font-medium">{data.personalInfo.role}</p>
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-12 relative z-10">
                    <div className="col-span-2 space-y-10">
                        {data.sections.filter(s => s.type === 'experience' || s.column === 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="w-10 h-2 bg-sky-100 rounded-full"></span>
                                    {section.title}
                                </h3>
                                <div className="space-y-8 pl-4">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div className="col-span-1 space-y-8 bg-slate-50 p-6 rounded-3xl">
                        {data.sections.filter(s => s.type !== 'experience' && s.column !== 'main').map(section => (
                            <section key={section.id}>
                                <h3 className="font-bold text-slate-800 mb-4 text-center border-b border-white pb-2">{section.title}</h3>
                                <div className="text-sm">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 55. Template 49: Lab Report (Clean Grid)
    const Template49 = () => (
        <div className="w-full h-full bg-white font-mono text-gray-800 p-12 border-4 border-gray-900 m-2 w-[calc(100%-16px)] h-[calc(100%-16px)]">
            <header className="border-b-2 border-gray-900 pb-6 mb-8 flex justify-between">
                <div>
                    <h1 className="text-2xl font-bold uppercase">Subject: {data.personalInfo.fullName}</h1>
                    <p className="text-sm mt-1">Role: {data.personalInfo.role}</p>
                </div>
                <div className="text-right text-xs space-y-1">
                    <div className="uppercase">Ref: {new Date().getFullYear()}-RESUME</div>
                    {data.personalInfo.email && <div>Contact: {data.personalInfo.email}</div>}
                </div>
            </header>

            <div className="grid grid-cols-2 gap-8 border-b-2 border-gray-900 pb-8 mb-8">
                {data.summary && (
                    <div className="col-span-2 p-4 bg-gray-50 border border-gray-200">
                        <strong>Observation:</strong> {data.summary}
                    </div>
                )}
            </div>

            <div className="space-y-8">
                {data.sections.map(section => (
                    <div key={section.id} className="grid grid-cols-12 gap-4">
                        <div className="col-span-3 text-right font-bold uppercase text-xs pt-1">
                            {section.title}
                        </div>
                        <div className="col-span-9 border-l-2 border-gray-200 pl-6 space-y-4">
                            {renderItems(section)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // 56. Template 50: The Finalist (Gold Standard)
    const Template50 = () => (
        <div className="w-full h-full bg-neutral-900 text-neutral-200 font-serif">
            <div className="h-full border-[20px] border-neutral-800 p-10 flex flex-col">
                <header className="text-center mb-16">
                    <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
                    <h1 className="text-5xl font-medium tracking-wide text-white mb-3">{data.personalInfo.fullName}</h1>
                    <p className="text-amber-500 uppercase tracking-[0.2em] text-sm">{data.personalInfo.role}</p>
                </header>

                <div className="flex-grow grid grid-cols-2 gap-16">
                    <div className="space-y-12">
                        {data.sections.filter((_, i) => i % 2 === 0).map(section => (
                            <section key={section.id}>
                                <h3 className="text-amber-500 text-xs font-sans font-bold uppercase mb-6 flex items-center gap-4">
                                    {section.title}
                                    <span className="h-px bg-neutral-800 flex-grow"></span>
                                </h3>
                                <div className="space-y-6">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div className="space-y-12">
                        {data.sections.filter((_, i) => i % 2 !== 0).map(section => (
                            <section key={section.id}>
                                <h3 className="text-amber-500 text-xs font-sans font-bold uppercase mb-6 flex items-center gap-4">
                                    {section.title}
                                    <span className="h-px bg-neutral-800 flex-grow"></span>
                                </h3>
                                <div className="space-y-6">
                                    {renderItems(section)}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                <footer className="mt-16 text-center text-xs text-neutral-600 font-sans uppercase tracking-widest border-t border-neutral-800 pt-8">
                    {data.personalInfo.email} &bull; {data.personalInfo.phone} &bull; {data.personalInfo.location}
                </footer>
            </div>
        </div>
    );

    const renderTemplate = () => {
        switch (templateId) {
            case 'modern': return <ModernClean />;
            case 'professional': return <Professional />;
            case 'creative': return <Creative />;
            case 'executive': return <Executive />;
            case 'minimal': return <Minimal />;
            case 'chicago': return <Chicago />;
            case 'tajmahal': return <TajMahal />;
            case 'windsor': return <Windsor />;
            case 'template1': return <Template1 />;
            case 'template2': return <Template2 />;
            case 'template3': return <Template3 />;
            case 'template4': return <Template4 />;
            case 'template5': return <Template5 />;
            case 'template6': return <Template6 />;
            case 'template7': return <Template7 />;
            case 'template8': return <Template8 />;
            case 'template9': return <Template9 />;
            case 'template10': return <Template10 />;
            case 'template11': return <Template11 />;
            case 'template12': return <Template12 />;
            case 'template13': return <Template13 />;
            case 'template14': return <Template14 />;
            case 'template15': return <Template15 />;
            case 'template16': return <Template16 />;
            case 'template17': return <Template17 />;
            case 'template18': return <Template18 />;
            case 'template19': return <Template19 />;
            case 'template20': return <Template20 />;
            case 'template21': return <Template21 />;
            case 'template22': return <Template22 />;
            case 'template23': return <Template23 />;
            case 'template24': return <Template24 />;
            case 'template25': return <Template25 />;
            case 'template26': return <Template26 />;
            case 'template27': return <Template27 />;
            case 'template28': return <Template28 />;
            case 'template29': return <Template29 />;
            case 'template30': return <Template30 />;
            case 'template31': return <Template31 />;
            case 'template32': return <Template32 />;
            case 'template33': return <Template33 />;
            case 'template34': return <Template34 />;
            case 'template35': return <Template35 />;
            case 'template36': return <Template36 />;
            case 'template37': return <Template37 />;
            case 'template38': return <Template38 />;
            case 'template39': return <Template39 />;
            case 'template40': return <Template40 />;
            case 'template41': return <Template41 />;
            case 'template42': return <Template42 />;
            case 'template43': return <Template43 />;
            case 'template44': return <Template44 />;
            case 'template45': return <Template45 />;
            case 'template46': return <Template46 />;
            case 'template47': return <Template47 />;
            case 'template48': return <Template48 />;
            case 'template49': return <Template49 />;
            case 'template50': return <Template50 />;
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
