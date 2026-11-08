import { worshipWeekdays, type WorshipColor, type WorshipKind, type WorshipSchedule, type WorshipWeekday } from "@/lib/worship-schedule";
import type { SiteContent } from "@/lib/site-content-model";
import { AddButton, EditorCard, Field, SelectField, TextArea, TextField } from "@/components/admin/admin-fields";

type WorshipContent = SiteContent["worship"];
type Service = WorshipContent["services"][number];
const weekdayLabels: Record<WorshipWeekday, string> = { sunday: "Domingo", monday: "Segunda-feira", tuesday: "Terça-feira", wednesday: "Quarta-feira", thursday: "Quinta-feira", friday: "Sexta-feira", saturday: "Sábado" };
const colorOptions: Array<{ value: WorshipColor; label: string }> = [{ value: "blue", label: "Azul" }, { value: "gold", label: "Dourado" }, { value: "violet", label: "Violeta" }, { value: "teal", label: "Verde azulado" }, { value: "rose", label: "Rosa" }];
const scheduleTypeOptions = [{ value: "weekly", label: "Toda semana" }, { value: "monthlyNthWeekday", label: "Semana específica do mês" }, { value: "monthlyDay", label: "Dia fixo do mês" }, { value: "once", label: "Evento em uma data" }];

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function newService(index: number): Service {
  return { id: `novo-evento-${Date.now()}-${index}`, name: "Novo evento", kind: "evento", description: "", badge: "Evento especial", time: "18:00", durationMinutes: 120, color: "violet", schedule: { type: "once", date: localToday() } };
}

function ScheduleFields({ service, onChange }: { service: Service; onChange: (schedule: WorshipSchedule) => void }) {
  const schedule = service.schedule;
  if (schedule.type === "weekly") return <Field label="Dias da semana"><div className="admin-choice-row">{worshipWeekdays.map((day) => <label className="admin-check" key={day}><input type="checkbox" checked={schedule.weekdays.includes(day)} onChange={(event) => {
    const weekdays = event.target.checked ? [...schedule.weekdays, day] : schedule.weekdays.filter((item) => item !== day);
    if (weekdays.length) onChange({ type: "weekly", weekdays });
  }} />{weekdayLabels[day]}</label>)}</div></Field>;
  if (schedule.type === "monthlyNthWeekday") return <div className="admin-grid-two"><SelectField label="Qual semana" value={String(schedule.nth)} options={[{ value: "1", label: "1ª" }, { value: "2", label: "2ª" }, { value: "3", label: "3ª" }, { value: "4", label: "4ª" }, { value: "-1", label: "Última" }]} onChange={(raw) => onChange({ type: "monthlyNthWeekday", weekday: schedule.weekday, nth: Number(raw) as 1 | 2 | 3 | 4 | -1 })} /><SelectField label="Dia da semana" value={schedule.weekday} options={worshipWeekdays.map((day) => ({ value: day, label: weekdayLabels[day] }))} onChange={(weekday) => onChange({ type: "monthlyNthWeekday", weekday: weekday as WorshipWeekday, nth: schedule.nth })} /></div>;
  if (schedule.type === "monthlyDay") return <TextField label="Dia do mês" type="number" min={1} max={31} value={String(schedule.day)} onChange={(raw) => onChange({ type: "monthlyDay", day: Math.min(31, Math.max(1, Number(raw) || 1)) })} />;
  return <TextField label="Data do evento" type="date" value={schedule.date} onChange={(date) => onChange({ type: "once", date })} />;
}

export function WorshipEditor({ value, onChange }: { value: WorshipContent; onChange: (next: WorshipContent) => void }) {
  function patchService(id: string, patch: Partial<Service>) { onChange({ ...value, services: value.services.map((item) => item.id === id ? { ...item, ...patch } : item) }); }
  function addService() { onChange({ ...value, services: [...value.services, newService(value.services.length)] }); }
  function removeService(id: string) { onChange({ ...value, services: value.services.filter((item) => item.id !== id).map((item) => ({ ...item, skipWhenSameDayAs: item.skipWhenSameDayAs?.filter((related) => related !== id) })) }); }

  return <div className="admin-section-stack">
    <div className="admin-section-intro"><h2>Agenda de cultos e eventos</h2><p>Crie quantos encontros precisar. Cada card pode ter uma cor, horário e regra de recorrência próprios.</p></div>
    <div className="admin-grid-two"><TextField label="Título da seção" value={value.title} onChange={(title) => onChange({ ...value, title })} /><TextField label="Fuso horário" value={value.timeZone} onChange={(timeZone) => onChange({ ...value, timeZone })} help="Ex.: America/Sao_Paulo" /><TextArea label="Descrição da seção" value={value.description} onChange={(description) => onChange({ ...value, description })} rows={3} /><TextField label="Texto do versículo" value={value.verse.text} onChange={(text) => onChange({ ...value, verse: { ...value.verse, text } })} /><TextField label="Referência bíblica" value={value.verse.reference} onChange={(reference) => onChange({ ...value, verse: { ...value.verse, reference } })} /></div>
    {value.services.map((service) => <EditorCard key={service.id} title={service.name || "Novo encontro"} onRemove={() => removeService(service.id)} removeLabel="Excluir encontro">
      <div className="admin-grid-two"><TextField label="Nome" value={service.name} onChange={(name) => patchService(service.id, { name })} /><SelectField label="Tipo" value={service.kind} options={[{ value: "culto", label: "Culto" }, { value: "evento", label: "Evento" }]} onChange={(kind) => patchService(service.id, { kind: kind as WorshipKind })} /><TextField label="Selo curto" value={service.badge} onChange={(badge) => patchService(service.id, { badge })} placeholder="Ex.: 2º domingo do mês" /><TextField label="Horário" type="time" value={service.time} onChange={(time) => patchService(service.id, { time })} /><TextField label="Duração (minutos)" type="number" min={1} max={1440} value={String(service.durationMinutes)} onChange={(raw) => patchService(service.id, { durationMinutes: Math.max(1, Number(raw) || 1) })} /><SelectField label="Cor do card" value={service.color} options={colorOptions} onChange={(color) => patchService(service.id, { color: color as WorshipColor })} /><TextField label="Local deste encontro" value={service.location || ""} onChange={(location) => patchService(service.id, { location })} placeholder="Usar endereço geral quando vazio" /><TextField label="Link de direções (opcional)" type="url" value={service.mapsUrl || ""} onChange={(mapsUrl) => patchService(service.id, { mapsUrl })} /></div>
      <TextArea label="Descrição do card" value={service.description} onChange={(description) => patchService(service.id, { description })} rows={3} />
      <SelectField label="Recorrência" value={service.schedule.type} options={scheduleTypeOptions} onChange={(type) => {
        if (type === "weekly") patchService(service.id, { schedule: { type, weekdays: ["sunday"] } });
        else if (type === "monthlyNthWeekday") patchService(service.id, { schedule: { type, weekday: "sunday", nth: 2 } });
        else if (type === "monthlyDay") patchService(service.id, { schedule: { type, day: 1 } });
        else patchService(service.id, { schedule: { type: "once", date: localToday() } });
      }} />
      <ScheduleFields service={service} onChange={(schedule) => patchService(service.id, { schedule })} />
      {value.services.length > 1 ? <Field label="Evitar dois cards no mesmo dia" help="Marque encontros que devem ser pulados quando este card tiver ocorrência na mesma data."><div className="admin-choice-row">{value.services.filter((other) => other.id !== service.id).map((other) => <label className="admin-check" key={other.id}><input type="checkbox" checked={service.skipWhenSameDayAs?.includes(other.id) ?? false} onChange={(event) => {
        const current = service.skipWhenSameDayAs ?? [];
        const skipWhenSameDayAs = event.target.checked ? [...current, other.id] : current.filter((id) => id !== other.id);
        patchService(service.id, { skipWhenSameDayAs });
      }} />{other.name}</label>)}</div></Field> : null}
    </EditorCard>)}
    <AddButton onClick={addService}>Adicionar culto ou evento</AddButton>
  </div>;
}
