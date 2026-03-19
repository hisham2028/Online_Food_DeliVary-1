/**
 * Add — Page Component
 *
 * Patterns:
 *   Factory         – FoodFormFactory.withField() produces immutable form snapshots
 *   Repository      – foodRepo.add() hides all API details
 *   Dependency Inj. – services from useServices() (ServiceContext)
 *   Observer        – emits FOOD_ADDED after success
 *   Sub-components  – ImageUploader, CategorySelect keep JSX focused
 */
import React, { useState, useCallback, useEffect } from 'react';
import './add.css';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { useServices } from '../../App';
import FoodFormFactory, { FoodFormData } from '../../factories/FoodFormFactory';
import { FOOD_CATEGORIES } from '../../models';
import EventBus, { EVENTS } from '../../events/EventBus';

// ─── ImageUploader ─────────────────────────────────────────────────────────────
const ImageUploader = ({ previewUrl, onChange }) => (
  <div className="add-img-upload flex-col">
    <p>Upload Image</p>
    <label htmlFor="image" className="img-label">
      <img
        src={previewUrl || assets.upload_area}
        alt="Upload preview"
      />
    </label>
    <input
      id="image"
      type="file"
      accept="image/*"
      hidden
      required
      onChange={(e) => onChange(e.target.files[0] ?? null)}
    />
  </div>
);

// ─── CategorySelect ────────────────────────────────────────────────────────────
const CategorySelect = ({ value, onChange }) => (
  <div className="add-category flex-col">
    <p>Category</p>
    <select name="category" value={value} onChange={onChange}>
      {FOOD_CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  </div>
);

// ─── Add ───────────────────────────────────────────────────────────────────────
const Add = () => {
  const { foodRepo } = useServices();

  const [formData,  setFormData]  = useState(() => FoodFormData.createEmpty());
  const [image,     setImage]     = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Manage object URL lifecycle to prevent memory leaks
  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  // Factory: immutable field update on every keystroke
  const onFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => FoodFormFactory.withField(prev, name, value));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!image) { toast.error('Please upload an image.'); return; }

    setIsLoading(true);
    try {
      const payload = new FoodFormData({ ...formData, image });
      const result  = await foodRepo.add(payload.toFormData());

      toast.success(result.message ?? 'Food item added!');
      EventBus.emit(EVENTS.FOOD_ADDED, { name: formData.name }); // Observer
      setFormData(FoodFormData.createEmpty());
      setImage(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmit}>
        <ImageUploader previewUrl={previewUrl} onChange={setImage} />

        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input
            type="text" name="name" placeholder="Type here"
            value={formData.name} onChange={onFieldChange} required
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea
            name="description" rows={6} placeholder="Write content here"
            value={formData.description} onChange={onFieldChange} required
          />
        </div>

        <div className="add-category-price">
          <CategorySelect value={formData.category} onChange={onFieldChange} />
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input
              type="number" name="price" placeholder="$20"
              value={formData.price} onChange={onFieldChange}
              min="0" step="0.01" required
            />
          </div>
        </div>

        <button type="submit" className="add-btn" disabled={isLoading}>
          {isLoading ? 'Adding…' : 'ADD'}
        </button>
      </form>
    </div>
  );
};

export default Add;
