import React from 'react';
import { useResume } from '../context/ResumeContext';
import { Edit2 } from 'lucide-react';

const CoverLetterForm = () => {
    const { coverLetterData, updateCoverLetter } = useResume();

    // Future AI Feature placeholder
    // const [isGenerating, setIsGenerating] = React.useState(false);
    // const handleAutoGenerate = ...

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-indigo-800">Cover Letter Editor</h3>
                    <p className="text-xs text-indigo-600">Tailor your message to the specific company.</p>
                </div>
                {/* Future Feature */}
                {/* <button onClick={handleAutoGenerate} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded flex items-center gap-1 font-bold shadow-sm hover:bg-indigo-700">
                    <Sparkles size={12} /> Auto-Write
                </button> */}
            </div>

            <section className="space-y-4">
                <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Edit2 size={16} /> Recipient Details</h4>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Recipient Name (e.g. John Doe)"
                        className="input-field p-2 border rounded focus:border-indigo-500 outline-none"
                        value={coverLetterData.recipientName}
                        onChange={(e) => updateCoverLetter('recipientName', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Recipient Title (e.g. Hiring Manager)"
                        className="input-field p-2 border rounded focus:border-indigo-500 outline-none"
                        value={coverLetterData.recipientTitle}
                        onChange={(e) => updateCoverLetter('recipientTitle', e.target.value)}
                    />
                </div>
                <input
                    type="text"
                    placeholder="Company Name"
                    className="input-field p-2 border rounded focus:border-indigo-500 outline-none w-full"
                    value={coverLetterData.companyName}
                    onChange={(e) => updateCoverLetter('companyName', e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Company Address"
                    className="input-field p-2 border rounded focus:border-indigo-500 outline-none w-full"
                    value={coverLetterData.companyAddress}
                    onChange={(e) => updateCoverLetter('companyAddress', e.target.value)}
                />
            </section>

            <section className="space-y-4">
                <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Edit2 size={16} /> Message Content</h4>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Salutation</label>
                    <input
                        type="text"
                        placeholder="Dear Hiring Manager,"
                        className="input-field p-2 border rounded focus:border-indigo-500 outline-none w-full"
                        value={coverLetterData.greeting}
                        onChange={(e) => updateCoverLetter('greeting', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Body Paragraphs</label>
                    <textarea
                        className="w-full p-4 border rounded-lg h-64 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm leading-relaxed"
                        placeholder="Express your interest in the role and highlight why you are the perfect fit..."
                        value={coverLetterData.body}
                        onChange={(e) => updateCoverLetter('body', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500">Sign-off</label>
                    <input
                        type="text"
                        placeholder="Sincerely,"
                        className="input-field p-2 border rounded focus:border-indigo-500 outline-none w-full"
                        value={coverLetterData.signOff}
                        onChange={(e) => updateCoverLetter('signOff', e.target.value)}
                    />
                </div>
            </section>
        </div>
    );
};

export default CoverLetterForm;
