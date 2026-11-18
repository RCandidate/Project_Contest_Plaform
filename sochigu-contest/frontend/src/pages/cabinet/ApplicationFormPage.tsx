import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationsApi } from '@/api/applications';
import { nominationsApi } from '@/api/nominations';
import { Nomination, AppFile, TeamMember, CreateApplicationDto } from '@/types';
import { Spinner } from '@/components/shared/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/shared/Modal';
import { formatSize } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';

const MAX_FILE_SIZE_MB = 6;
const MAX_FILES_TOTAL = 6;
const FILE_CATEGORY_LABELS: Record<string, string> = {
  project_file: 'Файл проекта',
  document_scan: 'Скан документа',
};

type Step = 1 | 2 | 3 | 4;

const STEPS = ['Номинация', 'Описание и команда', 'Файлы', 'Подтверждение'];
const STEP_TITLES = [
  'Шаг 1 из 4: Выбор номинации',
  'Шаг 2 из 4: Описание проекта',
  'Шаг 3 из 4: Загрузка файлов',
  'Шаг 4 из 4: Подтверждение',
];

interface Step2Fields {
  projectTitle: string;
  projectDescription: string;
  keywords: string;
}

const inputClass = 'w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring';

export function ApplicationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const {
    register,
    trigger,
    reset: resetStep2,
    getValues: getStep2,
    watch,
    formState: { errors: step2Errors },
  } = useForm<Step2Fields>({
    mode: 'onBlur',
    defaultValues: { projectTitle: '', projectDescription: '', keywords: '' },
  });

  const descLength = watch('projectDescription')?.length ?? 0;

  const [step, setStep] = useState<Step>(1);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [nominationId, setNominationId] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: '', role: '', email: '' }]);
  const [supervisor, setSupervisor] = useState({ name: '', title: '', email: '' });
  const [uploadedFiles, setUploadedFiles] = useState<AppFile[]>([]);
  const [fileToDelete, setFileToDelete] = useState<AppFile | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);
  const [appId, setAppId] = useState<string | null>(id ?? null);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [memberEmailErrors, setMemberEmailErrors] = useState<(string | undefined)[]>([]);
  const [supervisorEmailError, setSupervisorEmailError] = useState<string | undefined>();
  const savingRef = useRef(false);

  useEffect(() => {
    nominationsApi.getAll().then(setNominations).catch(() => setError('Не удалось загрузить номинации'));
    if (isEdit && id) {
      applicationsApi.getById(id).then(app => {
        setNominationId(app.nominationId);
        resetStep2({
          projectTitle: app.projectTitle,
          projectDescription: app.projectDescription,
          keywords: app.keywords?.join(', ') ?? '',
        });
        setTeamMembers(app.teamMembers?.length ? app.teamMembers : [{ name: '', role: '', email: '' }]);
        setSupervisor({
          name: app.supervisor?.name ?? '',
          title: app.supervisor?.title ?? '',
          email: app.supervisor?.email ?? '',
        });
        setUploadedFiles(app.files ?? []);
      }).catch(() => setError('Не удалось загрузить данные заявки')).finally(() => setLoading(false));
    }
  }, [id]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNext = async () => {
    if (step === 1) {
      if (!nominationId) return;
      setStep(2);
    } else if (step === 2) {
      const valid = await trigger(['projectTitle', 'projectDescription']);
      const emailErrs = teamMembers.map(m =>
        m.email && !validateEmail(m.email) ? 'Некорректный email' : undefined
      );
      const supErr = supervisor.email && !validateEmail(supervisor.email) ? 'Некорректный email' : undefined;
      setMemberEmailErrors(emailErrs);
      setSupervisorEmailError(supErr);
      if (!valid || emailErrs.some(Boolean) || supErr) return;
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const buildPayload = (): CreateApplicationDto => {
    const { projectTitle, projectDescription, keywords } = getStep2();
    return {
      nominationId,
      projectTitle,
      projectDescription,
      keywords: keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
      teamMembers: teamMembers.filter(m => m.name),
      supervisor: supervisor.name ? supervisor : undefined,
    };
  };

  const saveApp = async (): Promise<string> => {
    if (appId) { await applicationsApi.update(appId, buildPayload()); return appId; }
    const created = await applicationsApi.create(buildPayload());
    setAppId(created.id);
    return created.id;
  };

  const handleSaveDraft = async () => {
    setError(null);
    setSaving(true);
    try {
      await saveApp();
      navigate('/cabinet/application');
    } catch {
      setError('Не удалось сохранить черновик. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApp = async () => {
    setError(null);
    setSaving(true);
    try {
      const newId = await saveApp();
      await applicationsApi.submit(newId);
      navigate('/cabinet/application');
    } catch {
      setError('Не удалось подать заявку. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, category: string) => {
    setError(null);
    try {
      let targetId = appId;
      if (!targetId) {
        if (savingRef.current) return; // предотвращаем race condition
        savingRef.current = true;
        try { targetId = await saveApp(); } finally { savingRef.current = false; }
      }
      const uploaded = await applicationsApi.uploadFile(targetId, file, category);
      setUploadedFiles(prev => [...prev, uploaded]);
    } catch {
      setError('Не удалось загрузить файл. Попробуйте ещё раз.');
    }
  };

  const addMember = () => setTeamMembers(t => [...t, { name: '', role: '', email: '' }]);
  const handleFileDelete = async () => {
  if (!fileToDelete) return;
  const target = fileToDelete;
  setError(null);
  setDeletingFile(true);
  try {
    await applicationsApi.deleteFile(target.id);
    setUploadedFiles(prev => prev.filter(f => f.id !== target.id));
  } catch (err) {
    setError(getApiErrorMessage(err, 'Не удалось удалить файл. Попробуйте ещё раз.'));
  } finally {
    setDeletingFile(false);
    setFileToDelete(null);
  }
};
  const removeMember = (i: number) => setTeamMembers(t => t.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: keyof TeamMember, value: string) =>
    setTeamMembers(t => t.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-3xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? 'Редактировать заявку' : 'Подать заявку'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/cabinet')}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:opacity-90"
        >
          Отменить
        </button>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-8 flex items-center">
        {STEPS.map((label, idx) => {
          const n = (idx + 1) as Step;
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
                  ${done ? 'bg-accent text-accent-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {done ? '✓' : n}
                </div>
                <span className="mt-1 hidden text-xs text-muted-foreground sm:block">{label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${done ? 'bg-accent' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Контент шагов */}
      <div className="min-h-80 rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
        {/* Шаг 1 — Номинация */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{STEP_TITLES[0]}</h2>
            {nominations.length === 0 ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <div className="space-y-3">
                {nominations.map(nom => (
                  <button
                    key={nom.id}
                    type="button"
                    onClick={() => setNominationId(nom.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-colors
                      ${nominationId === nom.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-muted-foreground/40'}`}
                  >
                    <p className="font-semibold text-foreground">{nom.name}</p>
                    {nom.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{nom.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Шаг 2 — Описание и команда */}
        {step === 2 && (
          <motion.div key="step2" className="space-y-5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
            <h2 className="text-lg font-semibold text-foreground">{STEP_TITLES[1]}</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Название проекта <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register('projectTitle', {
                  required: 'Введите название проекта',
                  maxLength: { value: 200, message: 'Максимум 200 символов' },
                })}
                className={inputClass}
                placeholder="Краткое название проекта"
              />
              {step2Errors.projectTitle && (
                <p className="mt-1 text-xs text-destructive">{step2Errors.projectTitle.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Описание проекта <span className="text-destructive">*</span>{' '}
                <span className="font-normal text-muted-foreground">({descLength}/2000)</span>
              </label>
              <textarea
                rows={5}
                {...register('projectDescription', {
                  required: 'Введите описание проекта',
                  minLength: { value: 100, message: 'Минимум 100 символов' },
                  maxLength: { value: 2000, message: 'Максимум 2000 символов' },
                })}
                className={inputClass}
                placeholder="Подробное описание проекта (минимум 100 символов)"
              />
              {step2Errors.projectDescription && (
                <p className="mt-1 text-xs text-destructive">{step2Errors.projectDescription.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Ключевые слова</label>
              <input
                type="text"
                {...register('keywords')}
                className={inputClass}
                placeholder="Введите через запятую: инновации, IT, экология"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Состав команды</label>
                <button type="button" onClick={addMember}
                  className="text-sm font-medium text-primary hover:underline">
                  + Добавить участника
                </button>
              </div>
              <div className="space-y-2">
                {teamMembers.map((m, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="ФИО" value={m.name}
                      onChange={e => updateMember(i, 'name', e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Роль в проекте" value={m.role}
                      onChange={e => updateMember(i, 'role', e.target.value)} className={inputClass} />
                    <div className="flex gap-1">
                      <div className="flex-1">
                        <input type="email" placeholder="Email (необязательно)" value={m.email ?? ''}
                          onChange={e => { updateMember(i, 'email', e.target.value); setMemberEmailErrors(prev => prev.map((err, idx) => idx === i ? undefined : err)); }}
                          onBlur={() => { if (m.email && !validateEmail(m.email)) setMemberEmailErrors(prev => { const next = [...prev]; next[i] = 'Некорректный email'; return next; }); }}
                          className={`${inputClass}${memberEmailErrors[i] ? ' border-destructive' : ''}`} />
                        {memberEmailErrors[i] && <p className="mt-1 text-xs text-destructive">{memberEmailErrors[i]}</p>}
                      </div>
                      {teamMembers.length > 1 && (
                        <button type="button" onClick={() => removeMember(i)}
                          className="px-2 text-lg text-destructive hover:opacity-70">×</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Научный руководитель</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input type="text" placeholder="ФИО" value={supervisor.name}
                  onChange={e => setSupervisor(s => ({ ...s, name: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="Должность/звание" value={supervisor.title}
                  onChange={e => setSupervisor(s => ({ ...s, title: e.target.value }))} className={inputClass} />
                <div>
                  <input type="email" placeholder="Email (необязательно)" value={supervisor.email}
                    onChange={e => { setSupervisor(s => ({ ...s, email: e.target.value })); setSupervisorEmailError(undefined); }}
                    onBlur={() => { if (supervisor.email && !validateEmail(supervisor.email)) setSupervisorEmailError('Некорректный email'); }}
                    className={`${inputClass}${supervisorEmailError ? ' border-destructive' : ''}`} />
                  {supervisorEmailError && <p className="mt-1 text-xs text-destructive">{supervisorEmailError}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Шаг 3 — Файлы */}
        {step === 3 && (
          <motion.div key="step3" className="space-y-5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
            <h2 className="text-lg font-semibold text-foreground">{STEP_TITLES[2]}</h2>
            <FileUploadZone
              label="Файлы проекта"
              hint={`PDF, DOC, DOCX, PPT, ZIP, RAR — до ${MAX_FILE_SIZE_MB} МБ`}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
              category="project_file"
              currentCount={uploadedFiles.length}
              maxFiles={MAX_FILES_TOTAL}
              onUpload={handleFileUpload}
            />
            <FileUploadZone
              label="Сканы документов"
              hint={`PDF, JPG, PNG — до ${MAX_FILE_SIZE_MB} МБ`}
              accept=".pdf,.jpg,.jpeg,.png"
              category="document_scan"
              currentCount={uploadedFiles.length}
              maxFiles={MAX_FILES_TOTAL}
              onUpload={handleFileUpload}
            />
            {uploadedFiles.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Загруженные файлы ({uploadedFiles.length}/{MAX_FILES_TOTAL})
                </p>
                <div className="space-y-2">
                  {uploadedFiles.map(f => (
                    <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate text-foreground">{f.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {FILE_CATEGORY_LABELS[f.category] ?? 'Файл'} · {formatSize(f.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileToDelete(f)}
                        disabled={deletingFile}
                        className="flex-shrink-0 font-medium text-destructive hover:underline disabled:opacity-50"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Шаг 4 — Подтверждение */}
        {step === 4 && (
          <motion.div key="step4" className="space-y-5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
            <h2 className="text-lg font-semibold text-foreground">{STEP_TITLES[3]}</h2>
            <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Номинация: </span>
                <span className="font-medium text-foreground">
                  {nominations.find(n => n.id === nominationId)?.name ?? '—'}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Проект: </span>
                <span className="font-medium text-foreground">{getStep2().projectTitle || '—'}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Членов команды: </span>
                <span className="font-medium text-foreground">{teamMembers.filter(m => m.name).length}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Файлов: </span>
                <span className="font-medium text-foreground">{uploadedFiles.length}</span>
              </p>
              {supervisor.name && (
                <p>
                  <span className="text-muted-foreground">Научный руководитель: </span>
                  <span className="font-medium text-foreground">{supervisor.name}</span>
                </p>
              )}
            </div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">
                Подтверждаю корректность введённых данных
              </span>
            </label>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Навигация */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setStep(s => Math.max(1, s - 1) as Step)}
          disabled={step === 1}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          Назад
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && !nominationId}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-mid disabled:cursor-not-allowed disabled:opacity-40"
          >
            Далее
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light disabled:opacity-60"
            >
              {saving ? 'Сохраняем...' : 'Сохранить черновик'}
            </button>
            <button
              type="button"
              onClick={handleSubmitApp}
              disabled={saving || !confirmed}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Отправляем...' : 'Подать заявку'}
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={!!fileToDelete} onClose={() => { if (!deletingFile) setFileToDelete(null); }} title="Удалить файл?">
        <p className="mb-6 text-sm text-gray-600">
          Файл «{fileToDelete?.originalName}» будет удалён безвозвратно. Остальные данные заявки не изменятся.
        </p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setFileToDelete(null)} disabled={deletingFile}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60">
            Отмена
          </button>
          <button type="button" onClick={handleFileDelete} disabled={deletingFile}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {deletingFile ? 'Удаляем...' : 'Удалить'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}

function FileUploadZone({ label, hint, accept, category, currentCount, maxFiles, onUpload }: {
  label: string;
  hint: string;
  accept: string;
  category: string;
  currentCount: number;
  maxFiles: number;
  onUpload: (file: File, category: string) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const isFull = currentCount >= maxFiles;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (currentCount >= maxFiles) {
      setError(`Достигнут лимит: максимум ${maxFiles} файлов в категории.`);
      if (ref.current) ref.current.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Файл слишком большой. Максимум ${MAX_FILE_SIZE_MB} МБ.`);
      if (ref.current) ref.current.value = '';
      return;
    }
    setUploading(true);
    try { await onUpload(file, category); } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div
        onClick={() => !isFull && ref.current?.click()}
        className={`rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors ${isFull ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary'}`}
      >
        {uploading ? (
          <div className="flex justify-center"><Spinner /></div>
        ) : isFull ? (
          <p className="text-sm text-muted-foreground">Достигнут лимит ({currentCount}/{maxFiles})</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Нажмите для выбора файла ({currentCount}/{maxFiles})</p>
            <p className="mt-1 text-xs text-muted-foreground/60">{hint}</p>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" disabled={isFull} />
    </div>
  );
}
