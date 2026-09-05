import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STEPS = ['base', 'sauce', 'cheese', 'vegetable'];
const STEP_LABELS = {
  base: 'Step 1 — Choose a base',
  sauce: 'Step 2 — Choose a sauce',
  cheese: 'Step 3 — Choose a cheese',
  vegetable: 'Step 4 — Choose vegetables (pick any number)'
};

export default function PizzaBuilder() {
  const [inventory, setInventory] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, vegetable: [] });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/inventory').then(res => setInventory(res.data));
  }, []);

  const currentType = STEPS[stepIndex];
  const options = inventory.filter(item => item.type === currentType);
  const isMultiSelect = currentType === 'vegetable';

  function toggleOption(item) {
    if (isMultiSelect) {
      setSelection(prev => {
        const exists = prev.vegetable.some(v => v._id === item._id);
        const vegetable = exists
          ? prev.vegetable.filter(v => v._id !== item._id)
          : [...prev.vegetable, item];
        return { ...prev, vegetable };
      });
    } else {
      setSelection(prev => ({ ...prev, [currentType]: item }));
    }
  }

  function isSelected(item) {
    if (isMultiSelect) return selection.vegetable.some(v => v._id === item._id);
    return selection[currentType]?._id === item._id;
  }

  function canProceed() {
    if (isMultiSelect) return true; // vegetables are optional
    return Boolean(selection[currentType]);
  }

  function handleNext() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      sessionStorage.setItem('forno_builder_selection', JSON.stringify(selection));
      navigate('/order-summary');
    }
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else navigate('/dashboard');
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">🍕 Forno</div>
      </div>

      <h2 className="section-title">{STEP_LABELS[currentType]}</h2>

      <div className="option-grid">
        {options.map(item => (
          <div
            key={item._id}
            className={`option-card ${isSelected(item) ? 'is-selected' : ''} ${item.stockCount <= 0 ? 'is-disabled' : ''}`}
            onClick={() => item.stockCount > 0 && toggleOption(item)}
          >
            <div className="option-card__name">{item.name}</div>
            <div className="option-card__price">
              {item.stockCount <= 0 ? 'Out of stock' : `+ ₹${item.price}`}
            </div>
          </div>
        ))}
        {options.length === 0 && <p className="empty-note">No options available right now.</p>}
      </div>

      <div className="step-nav">
        <button className="btn btn-outline" onClick={handleBack}>
          {stepIndex === 0 ? 'Cancel' : 'Back'}
        </button>
        <button className="btn" onClick={handleNext} disabled={!canProceed()}>
          {stepIndex === STEPS.length - 1 ? 'Review order' : 'Next'}
        </button>
      </div>
    </div>
  );
}
