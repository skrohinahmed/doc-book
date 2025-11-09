import React, { useState } from 'react';
import '../../styles/components.css';

const DoctorFilter = ({ onFilterChange, filters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const specializations = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic',
    'Neurologist', 'Psychiatrist', 'General Physician', 'Gynecologist',
    'ENT Specialist', 'Ophthalmologist'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      specialization: '',
      city: '',
      minExperience: '',
      maxFee: '',
      search: '',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="filter-container">
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Search:</label>
            <input
              type="text"
              id="search"
              name="search"
              value={localFilters.search}
              onChange={handleChange}
              placeholder="Doctor name or hospital"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="specialization">Specialization:</label>
            <select
              id="specialization"
              name="specialization"
              value={localFilters.specialization}
              onChange={handleChange}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="city">City:</label>
            <input
              type="text"
              id="city"
              name="city"
              value={localFilters.city}
              onChange={handleChange}
              placeholder="City name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="minExperience">Min Experience:</label>
            <input
              type="number"
              id="minExperience"
              name="minExperience"
              value={localFilters.minExperience}
              onChange={handleChange}
              min="0"
              placeholder="Years"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxFee">Max Fee (₹):</label>
            <input
              type="number"
              id="maxFee"
              name="maxFee"
              value={localFilters.maxFee}
              onChange={handleChange}
              min="0"
              placeholder="Maximum fee"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">Apply Filters</button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorFilter;
