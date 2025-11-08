
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Movement, Settings, View, AppError, MovementOrigin } from './types';
import * as db from './services/db';
import { processReceiptImage, OCRResult } from './services/ocrService';
import CircularProgress from './components/CircularProgress';
import Modal from './components/Modal';
import Graph from './components/Graph';
import { APP_VERSION, PlusIcon, HomeIcon, CameraIcon, MenuIcon, DocumentIcon, GridIcon } from './constants';

const ErrorDisplay: React.FC<{ error: AppError, onClose: () => void }> = ({ error, onClose }) => (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-800/90 backdrop-blur-sm border border-red-600 text-white p-4 rounded-lg shadow-lg z-[100] flex items-center space-x-4 animate-fade-in-down">
        <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
            <p className="font-bold text-red-200">{error.code}</p>
            <p className="text-sm">{error.message}</p>
        </div>
        <button onClick={onClose} className="absolute top-1 right-1 text-red-300 hover:text-white rounded-full p-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <style>{`
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translate(-50%, -20px); }
                100% { opacity: 1; transform: translate(-50%, 0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        `}</style>
    </div>
);

const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [settings, setSettings] = useState<Settings | null>(null);
    const [movements, setMovements] = useState<Movement[]>([]);
    const [allMovements, setAllMovements] = useState<Movement[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);
    
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
    
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [movementToDelete, setMovementToDelete] = useState<number | null>(null);

    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const loadedSettings = await db.getSettings();
            setSettings(loadedSettings);
            const monthlyMovements = await db.getMovementsByMonth(currentMonth);
            const allMovementsData = await db.getAllMovements();
            setMovements(monthlyMovements);
            setAllMovements(allMovementsData);
        } catch (e) {
            setError({ code: 'E-STOR-01', message: 'Error al acceder al almacenamiento local.' });
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const { totalSpent, remaining, percentage } = useMemo(() => {
        const totalSpent = movements.reduce((sum, m) => sum + m.importe, 0);
        const initial = settings?.inicialMensual ?? 0;
        const remaining = initial - totalSpent;
        const percentage = initial > 0 ? Math.max(0, Math.min(100, (remaining / initial) * 100)) : 0;
        return { totalSpent, remaining, percentage };
    }, [movements, settings]);
    
    const handleAddOrUpdateMovement = async (data: { amount: number, description: string, origin: MovementOrigin, confidence?: number }) => {
        const movementData = {
            fechaISO: new Date().toISOString(),
            mesAño: currentMonth,
            importe: data.amount,
            descripcion: data.description,
            origen: data.origin,
            ocrConfianza: data.confidence,
        };

        try {
            if (editingMovement) {
                await db.updateMovement({ ...editingMovement, ...movementData, importe: data.amount, descripcion: data.description });
            } else {
                await db.addMovement(movementData);
            }
            closeAddModal();
            await loadData();
        } catch (e) {
            setError({ code: 'E-STOR-01', message: 'Error al acceder al almacenamiento local.'});
        }
    };
    
    const handleDeleteMovement = (id: number) => {
        setMovementToDelete(id);
        setConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setConfirmModalOpen(false);
        setMovementToDelete(null);
    };

    const confirmDelete = async () => {
        if (movementToDelete !== null) {
            try {
                await db.deleteMovement(movementToDelete);
                await loadData();
            } catch (e) {
                setError({ code: 'E-STOR-01', message: 'Error al acceder al almacenamiento local.'});
            } finally {
                closeConfirmModal();
            }
        }
    };

    const handleUpdateSettings = async (newSettings: Omit<Settings, 'id'>) => {
        try {
            await db.updateSettings(newSettings);
            setSettings({ ...newSettings, id: 'default' });
            alert("Ajustes guardados.");
            setView('home');
        } catch (e) {
             setError({ code: 'E-STOR-01', message: 'Error al acceder al almacenamiento local.'});
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsOcrLoading(true);
            setOcrResult(null);
            setAddModalOpen(true);
            try {
                const result = await processReceiptImage(file);
                setOcrResult(result);
            } catch (e) {
                setError({ code: 'E-OCR-01', message: 'El texto del ticket es ilegible o no se encontró un importe.' });
            } finally {
                setIsOcrLoading(false);
            }
        }
    };

    const openAddModal = (movement: Movement | null = null) => {
        setEditingMovement(movement);
        setOcrResult(null);
        setIsOcrLoading(false);
        setAddModalOpen(true);
    };

    const closeAddModal = () => {
        setAddModalOpen(false);
        setEditingMovement(null);
    };

    const handleExportData = async () => {
        try {
            const allData = await db.getAllMovements();
            const dataStr = JSON.stringify(allData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `talos_export_${new Date().toISOString().slice(0,10)}.json`;
    
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            linkElement.remove();
            setIsMenuOpen(false);
        } catch (e) {
            setError({ code: 'E-EXPORT-01', message: 'Error al exportar los datos.'});
            console.error(e);
        }
    };
    
    const renderHome = () => (
        <div className="flex flex-col items-center justify-start h-full text-center p-4">
             <CircularProgress size={250} strokeWidth={20} percentage={percentage}>
                <span className="text-5xl font-bold tracking-tighter">{percentage.toFixed(0)}%</span>
                <span className="text-lg text-gray-400 mt-1">restante</span>
             </CircularProgress>
             <div className="w-full max-w-sm mt-6 text-gray-300 flex-grow flex flex-col px-4">
                <div> 
                    <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
                        <span>Restante</span>
                        <span className="font-bold text-lg text-white">{remaining.toFixed(2)}€</span>
                    </div>
                     <div className="flex justify-between items-center py-4 border-b border-slate-800/50">
                        <span>Gastado este mes</span>
                        <span className="font-bold text-lg text-white">{totalSpent.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span>Presupuesto inicial</span>
                        <span className="font-bold text-lg text-white">{settings?.inicialMensual.toFixed(2)}€</span>
                    </div>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <button onClick={() => openAddModal()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg">
                        <PlusIcon className="w-8 h-8"/>
                    </button>
                </div>
             </div>
        </div>
    );
    
    const renderHistory = () => {
        const groupedMovements = allMovements.reduce((acc, mov) => {
            (acc[mov.mesAño] = acc[mov.mesAño] || []).push(mov);
            return acc;
        }, {} as Record<string, Movement[]>);

        const sortedMonths = Object.keys(groupedMovements).sort().reverse();

        return (
            <div className="p-4 text-white">
                {sortedMonths.length === 0 ? <p className="text-gray-400 text-center mt-8">No hay gastos registrados.</p> : sortedMonths.map(month => (
                    <div key={month} className="mb-6">
                         <h2 className="text-lg font-semibold text-gray-400 pb-2 mb-3">{new Date(`${month}-02`).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                         <ul className="space-y-3">
                             {groupedMovements[month].sort((a,b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime()).map(mov => (
                                <li key={mov.id} className="bg-slate-800/50 p-4 rounded-xl flex justify-between items-center">
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{mov.importe.toFixed(2)}€</p>
                                        <p className="text-sm text-gray-300">{mov.descripcion || "Sin descripción"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{new Date(mov.fechaISO).toLocaleString('es-ES')}</p>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <button onClick={() => openAddModal(mov)} className="text-sm text-blue-400 hover:text-blue-300">Editar</button>
                                        <button onClick={() => handleDeleteMovement(mov.id)} className="text-sm text-red-400 hover:text-red-300">Borrar</button>
                                    </div>
                                </li>
                             ))}
                         </ul>
                    </div>
                ))}
            </div>
        );
    };

    const SettingsForm: React.FC<{ s: Settings, onSave: (data: Omit<Settings, 'id'>) => void }> = ({ s, onSave }) => {
        const [initial, setInitial] = useState(s.inicialMensual);
        const [threshold, setThreshold] = useState(s.ocrConfidenceThreshold);
        
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave({ inicialMensual: initial, ocrConfidenceThreshold: threshold });
        };

        return (
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="initial" className="block mb-2 text-sm font-medium text-gray-300">Presupuesto Mensual Inicial (€)</label>
                    <input type="number" id="initial" value={initial} onChange={e => setInitial(parseFloat(e.target.value))} className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3" step="0.01" required />
                </div>
                <div>
                    <label htmlFor="threshold" className="block mb-2 text-sm font-medium text-gray-300">Umbral de Confianza OCR (%)</label>
                    <input type="number" id="threshold" value={threshold} onChange={e => setThreshold(parseInt(e.target.value, 10))} className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3" min="0" max="100" required />
                </div>
                <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3 text-center">Guardar Cambios</button>
            </form>
        );
    };

    const renderSettings = () => (
         <div className="p-4 text-white">
            {settings && <SettingsForm s={settings} onSave={handleUpdateSettings} />}
            <p className="text-center text-gray-600 text-sm mt-8">Talos - Versión {APP_VERSION}</p>
        </div>
    );

    const renderGraph = () => {
        const monthlyData = allMovements.reduce((acc, mov) => {
            const month = mov.mesAño;
            if (!acc[month]) {
                acc[month] = 0;
            }
            acc[month] += mov.importe;
            return acc;
        }, {} as Record<string, number>);

        const sortedData = Object.entries(monthlyData)
            .map(([month, total]) => ({ month, total }))
            .sort((a, b) => a.month.localeCompare(b.month));

        const recentData = sortedData.slice(-6);

        return <Graph data={recentData} />;
    };
    
    const AddExpenseForm: React.FC<{ onSubmit: (data: {amount: number, description: string, origin: MovementOrigin, confidence?: number}) => void; movement: Movement | null; }> = ({ onSubmit, movement }) => {
        const [amount, setAmount] = useState<number | ''>(movement?.importe ?? '');
        const [description, setDescription] = useState(movement?.descripcion ?? '');
        
        useEffect(() => {
            if (ocrResult && ocrResult.confidence >= (settings?.ocrConfidenceThreshold ?? 70)) {
                setAmount(ocrResult.amount);
            }
        }, [ocrResult, settings]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (typeof amount === 'number' && amount > 0) {
                 onSubmit({ amount, description, origin: ocrResult ? 'ocr' : 'manual', confidence: ocrResult?.confidence});
            } else {
                alert("El importe debe ser un número positivo.");
            }
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="flex items-center justify-center p-4 bg-slate-800/50 rounded-lg">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center space-y-2 text-blue-400 hover:text-blue-300">
                        <CameraIcon className="w-10 h-10" />
                        <span>Escanear Ticket</span>
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>

                {isOcrLoading && <p className="text-center text-gray-400">Procesando imagen...</p>}

                {ocrResult && (
                    <div className={`p-3 rounded-lg text-center ${ocrResult.confidence >= (settings?.ocrConfidenceThreshold ?? 70) ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                        <p>Importe detectado: <strong>{ocrResult.amount.toFixed(2)}€</strong></p>
                        <p className="text-sm text-gray-300">Confianza: {ocrResult.confidence.toFixed(0)}%</p>
                        {ocrResult.confidence < (settings?.ocrConfidenceThreshold ?? 70) && <p className="text-xs mt-1 text-yellow-400">Confianza baja. Verifique el importe.</p>}
                    </div>
                )}

                <div>
                    <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-300">Importe (€)</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3" step="0.01" required />
                </div>
                 <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Descripción (Opcional)</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3" />
                </div>
                <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3 text-center">{movement ? 'Actualizar' : 'Añadir'} Gasto</button>
            </form>
        )
    };
    
    if (isLoading && !settings) {
        return <div className="flex items-center justify-center h-screen text-white text-xl">Cargando...</div>;
    }
    
    return (
        <div className="bg-transparent text-gray-200 min-h-screen font-sans flex flex-col">
            <header className="flex justify-between items-center p-5">
              <div className="relative" ref={menuRef}>
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 border border-gray-600 rounded-lg p-2 hover:bg-slate-800">
                    <MenuIcon className="w-6 h-6"/>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute top-14 left-0 bg-slate-800 rounded-lg shadow-lg p-2 z-10 w-48 border border-slate-700">
                      <ul>
                        <li>
                          <button
                            onClick={() => { setView('graph'); setIsMenuOpen(false); }}
                            className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 rounded"
                          >
                            Ver Gráfica Mensual
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleExportData}
                            className="text-white block w-full text-left px-4 py-2 text-sm hover:bg-slate-700 rounded"
                          >
                            Exportar Datos
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white uppercase tracking-widest">
                    TALOS V {APP_VERSION}
                </h1>
                <p className="text-xs text-gray-500">By SySmcn ©2025</p>
              </div>
              <div className="w-10"></div>
            </header>
            
            {error && <ErrorDisplay error={error} onClose={() => setError(null)} />}

            <main className="flex-grow overflow-y-auto relative pb-20">
                {view === 'home' && renderHome()}
                {view === 'history' && renderHistory()}
                {view === 'settings' && renderSettings()}
                {view === 'graph' && renderGraph()}
            </main>
            
            <footer className="bg-slate-900/70 backdrop-blur-sm p-2 shadow-inner fixed bottom-0 w-full border-t border-slate-700/50">
                <nav className="flex justify-around">
                    <button onClick={() => setView('home')} className={`flex flex-col items-center p-2 rounded-lg transition-colors w-1/3 ${view === 'home' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
                        <HomeIcon className="w-7 h-7"/>
                    </button>
                    <button onClick={() => setView('history')} className={`flex flex-col items-center p-2 rounded-lg transition-colors w-1/3 ${view === 'history' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
                        <DocumentIcon className="w-7 h-7"/>
                    </button>
                    <button onClick={() => setView('settings')} className={`flex flex-col items-center p-2 rounded-lg transition-colors w-1/3 ${view === 'settings' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
                        <GridIcon className="w-7 h-7"/>
                    </button>
                </nav>
            </footer>

            <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title={editingMovement ? "Editar Gasto" : "Añadir Gasto"}>
                <AddExpenseForm onSubmit={handleAddOrUpdateMovement} movement={editingMovement} />
            </Modal>

            <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} title="Confirmar Eliminación">
                <div className="text-center">
                    <p className="mb-6 text-gray-300">¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.</p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={closeConfirmModal}
                            className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default App;