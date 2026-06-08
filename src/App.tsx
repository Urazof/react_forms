import { useState } from 'react';
import { useAppSelector } from './store/hooks';
import { Modal } from './components/Modal/Modal';
import { UncontrolledForm } from './components/forms/UncontrolledForm/UncontrolledForm';
import { RHFForm } from './components/forms/RHFForm/RHFForm';
import { SubmissionCard } from './components/cards/SubmissionCard/SubmissionCard';
import './App.css';

type FormType = 'uncontrolled' | 'rhf';

function App() {
  const [activeForm, setActiveForm] = useState<FormType | null>(null);
  const submissions = useAppSelector((state) => state.submissions);

  return (
    <main className="app">
      <h1 className="app-title">React Forms</h1>

      <div className="app-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setActiveForm('uncontrolled')}
        >
          Неконтролируемая форма
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setActiveForm('rhf')}
        >
          React Hook Form
        </button>
      </div>

      {submissions.length === 0 ? (
        <p className="no-submissions">Отправок пока нет</p>
      ) : (
        <section aria-label="Отправленные данные">
          <h2 className="submissions-title">
            Отправленные данные ({submissions.length})
          </h2>
          <div className="submissions-grid">
            {[...submissions].reverse().map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))}
          </div>
        </section>
      )}

      <Modal
        isOpen={activeForm !== null}
        onClose={() => setActiveForm(null)}
        title={
          activeForm === 'rhf' ? 'React Hook Form' : 'Неконтролируемая форма'
        }
      >
        {activeForm === 'uncontrolled' && (
          <UncontrolledForm onClose={() => setActiveForm(null)} />
        )}
        {activeForm === 'rhf' && (
          <RHFForm onClose={() => setActiveForm(null)} />
        )}
      </Modal>
    </main>
  );
}

export default App;
