import { useState } from 'react';
import { Modal } from './components/Modal/Modal';
import { UncontrolledForm } from './components/forms/UncontrolledForm/UncontrolledForm';
import { RHFForm } from './components/forms/RHFForm/RHFForm';
import './App.css';

type FormType = 'uncontrolled' | 'rhf';

function App() {
  const [activeForm, setActiveForm] = useState<FormType | null>(null);

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
