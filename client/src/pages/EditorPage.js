import React, { useRef, useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { ContentOptimizer, ExperienceForm, EducationForm } from '../components/FormSections';
import CoverLetterForm from '../components/CoverLetterForm';
import TemplateViewer from '../components/TemplateViewer';
import { optimizeContent, analyzePhoto, getATSScore, generateDescription } from '../services/api';
import { Plus, Download, Trash2, Layout, Upload, Camera, AlertCircle, CheckCircle, Edit2, Settings, GripVertical, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Section Component ---
const SortableSection = ({ section, children, onRemove, onMoveColumn }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm group">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                {/* Drag Handle */}
                <div className="flex items-center gap-2 flex-1">
                    <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-indigo-600 outline-none">
                        <GripVertical size={20} />
                    </button>
                    {children[0]} {/* Title Input */}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onMoveColumn(section.id, section.column === 'sidebar' ? 'main' : 'sidebar')}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 border border-gray-200"
                        title={section.column === 'sidebar' ? "Move to Main Column" : "Move to Sidebar"}
                    >
                        {section.column === 'sidebar' ? <Layout size={14} className="rotate-180" /> : <Layout size={14} />}
                    </button>
                    {children[1]} {/* Type Selector */}
                    <button onClick={() => onRemove(section.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                </div>
            </div>
            {children[2]} {/* Content */}
        </div>
    );
};

const EditorPage = () => {
    const {
        resumeData, updateMeta, updatePersonalInfo,
        addSection, removeSection, reorderSections,
        addItemToSection, updateSectionItem, removeSectionItem,
        updateSectionTitle, updateSectionType, updateSectionColumn,
        selectedDesign, jobDescription,
        activeDocument, setActiveDocument
    } = useResume();

    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState(null);
    const [atsData, setAtsData] = useState(null);
    const [atsLoading, setAtsLoading] = useState(false);

    const previewRef = useRef();

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = resumeData.sections.findIndex((s) => s.id === active.id);
            const newIndex = resumeData.sections.findIndex((s) => s.id === over.id);
            reorderSections(arrayMove(resumeData.sections, oldIndex, newIndex));
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAnalyzingPhoto(true);
        setPhotoError(null);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            // Immediate update for preview
            updatePersonalInfo('photo', base64);
            updatePersonalInfo('photoFeedback', null); // Reset old feedback

            // 2. Analyze with AI
            try {
                console.log("Sending photo for analysis...");
                const result = await analyzePhoto(base64);
                if (result) {
                    updatePersonalInfo('photoFeedback', result);
                } else {
                    throw new Error("Empty response from AI");
                }
            } catch (err) {
                console.error("Photo analysis failed", err);
                setPhotoError("AI could not analyze the photo. Please check your backend connection.");
            } finally {
                setAnalyzingPhoto(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const getFeedbackColor = (status) => {
        if (!status) return 'border-gray-200 text-gray-500';
        switch (status.toLowerCase()) {
            case 'green': return 'border-green-500 text-green-600 bg-green-50';
            case 'yellow': return 'border-yellow-500 text-yellow-600 bg-yellow-50';
            case 'red': return 'border-red-500 text-red-600 bg-red-50';
            default: return 'border-gray-200 text-gray-500';
        }
    };

    const handleAIMagic = async (section, content) => {
        try {
            const optimized = await optimizeContent(section, content, resumeData.personalInfo.role || "Professional");
            if (!optimized) throw new Error("No content returned");
            return optimized;
        } catch (error) {
            alert("AI Optimization failed. Ensure backend is running.");
            console.error(error);
            return null;
        }
    };

    const calculateATS = async () => {
        setAtsLoading(true);
        try {
            // Aggregate all text for analysis
            const resumeText = JSON.stringify(resumeData);
            const result = await getATSScore(resumeText, jobDescription);
            setAtsData(result);
        } catch (e) {
            alert("Failed to calculate ATS Score");
        } finally {
            setAtsLoading(false);
        }
    }

    const downloadPDF = async () => {
        if (!previewRef.current) return;

        const fileName = prompt("Enter file name for PDF:", "my-resume");
        if (!fileName) return;

        setGeneratingPdf(true);
        try {
            // Temporarily hide watermark via CSS class or ref manipulation
            const watermark = document.getElementById('watermark-overlay');
            if (watermark) watermark.style.display = 'none';

            const canvas = await html2canvas(previewRef.current, {
                scale: 3,
                useCORS: true,
                letterRendering: true, // Improve text spacing
                scrollX: 0,
                scrollY: 0
            });

            if (watermark) watermark.style.display = 'flex'; // Restore watermark

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${fileName}.pdf`);
        } catch (err) {
            console.error("PDF Gen Error", err);
            alert("Failed to generate PDF");
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleAddCustomField = (sectionId, itemIndex) => {
        const key = prompt("Enter field name (e.g. 'Location', 'GPA', 'Tech Stack'):");
        if (key) {
            updateSectionItem(sectionId, itemIndex, key, "Value");
        }
    };

    const renderSectionForm = (section) => {
        return (
            <SortableSection key={section.id} section={section} onRemove={removeSection} onMoveColumn={updateSectionColumn}>
                {/* Child 1: Title Input (passed to wrapper) */}
                <div className="flex items-center gap-2 w-full">
                    <input
                        className="font-bold text-lg text-gray-800 border-none focus:ring-2 focus:ring-indigo-100 rounded px-1 outline-none w-full bg-transparent"
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    />
                    <Edit2 size={14} className="text-gray-400" />
                </div>

                {/* Child 2: Type Select (passed to wrapper) */}
                {section.type !== 'experience' && section.type !== 'education' && (
                    <select
                        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none"
                        value={section.type}
                        onChange={(e) => updateSectionType(section.id, e.target.value)}
                    >
                        <option value="list">Bulletin</option>
                        <option value="paragraph">Paragraph</option>
                        <option value="skills">Tags</option>
                    </select>
                )}

                {/* Child 3: Content (passed to wrapper) */}
                <div className="w-full">
                    {section.type === 'experience' && (
                        <div>
                            {section.items.map((item, idx) => (
                                <div key={idx} className="mb-4 p-3 bg-gray-50 rounded border border-gray-100 relative">
                                    <ExperienceForm
                                        experience={item}
                                        onChange={(field, val) => updateSectionItem(section.id, idx, field, val)}
                                        onRemove={() => removeSectionItem(section.id, idx)}
                                        onOptimize={async () => {
                                            const newDesc = await handleAIMagic("Experience", item.description);
                                            if (newDesc) updateSectionItem(section.id, idx, 'description', newDesc);
                                        }}
                                        onGenerate={async (title, company) => {
                                            try {
                                                const points = await generateDescription(title, company);
                                                if (points) updateSectionItem(section.id, idx, 'description', points);
                                            } catch (e) {
                                                alert("Failed to generate content");
                                            }
                                        }}
                                    />
                                    <div className="mt-2 text-right">
                                        <button onClick={() => handleAddCustomField(section.id, idx)} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                                            + Add Custom Field
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addItemToSection(section.id, {})} className="w-full py-2 border border-dashed border-indigo-300 text-indigo-600 rounded flex items-center justify-center gap-2 hover:bg-indigo-50 mt-2 text-sm font-medium"><Plus size={16} /> Add Position</button>
                        </div>
                    )}

                    {section.type === 'education' && (
                        <div>
                            {section.items.map((item, idx) => (
                                <div key={idx} className="mb-4 p-3 bg-gray-50 rounded border border-gray-100">
                                    <EducationForm
                                        education={item}
                                        onChange={(field, val) => updateSectionItem(section.id, idx, field, val)}
                                        onRemove={() => removeSectionItem(section.id, idx)}
                                    />
                                    <div className="mt-2 text-right">
                                        <button onClick={() => handleAddCustomField(section.id, idx)} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                                            + Add Custom Field
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addItemToSection(section.id, {})} className="w-full py-2 border border-dashed border-indigo-300 text-indigo-600 rounded flex items-center justify-center gap-2 hover:bg-indigo-50 mt-2 text-sm font-medium"><Plus size={16} /> Add Education</button>
                        </div>
                    )}

                    {(section.type === 'list' || section.type === 'skills') && (
                        <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {section.items.map((item, idx) => (
                                    <div key={idx} className="group relative flex items-center">
                                        <input
                                            className="bg-gray-100 border border-transparent hover:border-gray-300 rounded px-3 py-1.5 text-sm font-medium w-full min-w-[120px] focus:bg-white focus:border-indigo-300 outline-none transition-all"
                                            value={typeof item === 'string' ? item : item.text || ''}
                                            onChange={(e) => updateSectionItem(section.id, idx, null, e.target.value)}
                                            placeholder="Item..."
                                        />
                                        <button onClick={() => removeSectionItem(section.id, idx)} className="ml-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => addItemToSection(section.id, "New Item")} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline"><Plus size={14} /> Add Item</button>
                        </div>
                    )}

                    {section.type === 'paragraph' && (
                        <div>
                            <textarea
                                className="w-full p-3 border rounded text-sm text-gray-700 bg-gray-50 h-24"
                                value={section.items[0] || ''}
                                onChange={(e) => {
                                    if (section.items.length === 0) addItemToSection(section.id, e.target.value);
                                    else updateSectionItem(section.id, 0, null, e.target.value);
                                }}
                                placeholder="Write your content here..."
                            />
                        </div>
                    )}
                </div>
            </SortableSection>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Editor Sidebar */}
            <div className="w-1/2 flex flex-col border-r border-gray-300 bg-white h-full shadow-xl z-20">
                <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveDocument('resume')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeDocument === 'resume' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FileText size={14} /> Resume
                        </button>
                        <button
                            onClick={() => setActiveDocument('coverLetter')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeDocument === 'coverLetter' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Edit2 size={14} /> Cover Letter
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {resumeData.sections.length > 0 && jobDescription && (
                            <button
                                onClick={calculateATS}
                                disabled={atsLoading}
                                className="flex gap-2 items-center px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-bold"
                            >
                                {atsLoading ? 'Scoring...' : 'ATS Score'}
                            </button>
                        )}
                        <button onClick={downloadPDF} disabled={generatingPdf} className="btn-primary flex gap-2 items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow text-sm font-semibold">
                            <Download size={16} /> Download PDF
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">

                    {/* Mode Switching Content */}
                    {activeDocument === 'resume' ? (
                        <>
                            {/* ATS Result */}
                            {atsData && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 animate-fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle size={18} /> ATS Score: {atsData.score}/100</h3>
                                        <button onClick={() => setAtsData(null)} className="text-emerald-600 hover:text-emerald-800"><Trash2 size={14} /></button>
                                    </div>
                                    <p className="text-sm text-emerald-700 mb-2">{atsData.feedback}</p>
                                    {atsData.missingKeywords && atsData.missingKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {atsData.missingKeywords.map(k => (
                                                <span key={k} className="text-xs bg-white border border-emerald-200 px-2 py-0.5 rounded text-emerald-600 font-medium">{k}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <section className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Settings size={16} /> Personal Details</h3>

                                <div className="flex items-start gap-6 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="relative group">
                                        <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${resumeData.personalInfo.photoFeedback ? getFeedbackColor(resumeData.personalInfo.photoFeedback.status).replace('text-', 'border-') : 'border-gray-200'} bg-white flex items-center justify-center shadow-inner relative group`}>
                                            {resumeData.personalInfo.photo ? (
                                                <>
                                                    <img src={resumeData.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            updatePersonalInfo('photo', null);
                                                            updatePersonalInfo('photoFeedback', null);
                                                        }}
                                                        className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                        title="Remove Photo"
                                                    >
                                                        <Trash2 size={24} />
                                                    </button>
                                                </>
                                            ) : (
                                                <Camera className="text-gray-300" size={40} />
                                            )}
                                        </div>
                                        {!resumeData.personalInfo.photo && (
                                            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg transform translate-y-1/4 translate-x-1/4 transition-transform hover:scale-110">
                                                <Upload size={16} />
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">Profile Photo</h4>
                                        {analyzingPhoto ? (
                                            <div className="text-sm text-indigo-600 animate-pulse flex items-center gap-2 mt-2">
                                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                Analyzing quality...
                                            </div>
                                        ) : photoError ? (
                                            <div className="text-sm text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={14} /> {photoError}</div>
                                        ) : resumeData.personalInfo.photoFeedback ? (
                                            <div className={`mt-2 p-3 rounded-lg border text-sm ${getFeedbackColor(resumeData.personalInfo.photoFeedback.status)}`}>
                                                <div className="flex items-center gap-2 font-bold mb-1">
                                                    {resumeData.personalInfo.photoFeedback.status === 'Green' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                    {resumeData.personalInfo.photoFeedback.status} Match • Score: {resumeData.personalInfo.photoFeedback.score}/100
                                                </div>
                                                <p className="leading-snug opacity-90">{resumeData.personalInfo.photoFeedback.feedback}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                Upload a photo to get <span className="font-semibold text-indigo-600">instant AI feedback</span> on lighting, background, and professionalism.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Full Name" className="input-field p-2 border rounded focus:border-indigo-500 outline-none" value={resumeData.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} />
                                    <input type="text" placeholder="Job Title" className="input-field p-2 border rounded focus:border-indigo-500 outline-none" value={resumeData.personalInfo.role} onChange={(e) => updatePersonalInfo('role', e.target.value)} />
                                    <input type="email" placeholder="Email" className="input-field p-2 border rounded focus:border-indigo-500 outline-none" value={resumeData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
                                    <input type="text" placeholder="Phone" className="input-field p-2 border rounded focus:border-indigo-500 outline-none" value={resumeData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
                                    <input type="text" placeholder="Location" className="input-field p-2 border rounded focus:border-indigo-500 outline-none" value={resumeData.personalInfo.location || ''} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
                                    <input type="text" placeholder="LinkedIn / Website" className="input-field p-2 border rounded focus:border-indigo-500 outline-none" value={resumeData.personalInfo.linkedin} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} />
                                </div>
                            </section>

                            <section className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-gray-800">Professional Summary</h3>
                                    <ContentOptimizer section="summary" content={resumeData.summary} onOptimize={async () => {
                                        const newText = await handleAIMagic("Bio", resumeData.summary);
                                        if (newText) updateMeta('summary', newText);
                                    }} />
                                </div>
                                <textarea
                                    className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm leading-relaxed"
                                    value={resumeData.summary}
                                    onChange={(e) => updateMeta('summary', e.target.value)}
                                    placeholder="Briefly describe your professional background and goals..."
                                />
                            </section>

                            {/* DnD Context */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={resumeData.sections} strategy={verticalListSortingStrategy}>
                                    {resumeData.sections.map(section => renderSectionForm(section))}
                                </SortableContext>
                            </DndContext>

                            <div className="pt-6 border-t">
                                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Add Section</h4>
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => addSection("Experience", "experience")} className="btn-add-section"><Plus size={14} /> Work Experience</button>
                                    <button onClick={() => addSection("Education", "education")} className="btn-add-section"><Plus size={14} /> Education</button>
                                    <button onClick={() => addSection("Skills", "skills")} className="btn-add-section"><Plus size={14} /> Skills</button>
                                    <button onClick={() => addSection("Custom List", "list")} className="btn-add-section"><Plus size={14} /> Custom List</button>
                                    <button onClick={() => addSection("Custom Text", "paragraph")} className="btn-add-section"><Plus size={14} /> Custom Text</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <CoverLetterForm />
                    )}
                </div>
            </div>

            <div className="w-1/2 bg-gray-600 flex justify-center overflow-y-auto p-12 custom-scrollbar">
                <div className="transform origin-top scale-95 transition-transform duration-500 ease-in-out">
                    <div style={{ width: '210mm', minHeight: '297mm' }} className="bg-white shadow-2xl relative">
                        {/* Watermark Overlay */}
                        <div id="watermark-overlay" className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none opacity-10">
                            <div className="transform -rotate-45 text-9xl font-black text-gray-400 select-none">
                                DRAFT
                            </div>
                        </div>

                        <div className="pdf-container h-full">
                            <TemplateViewer ref={previewRef} data={resumeData} templateId={selectedDesign} activeDocument={activeDocument} coverLetterData={useResume().coverLetterData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
