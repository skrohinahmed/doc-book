import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import DoctorCard from './DoctorCard';
import DoctorFilter from './DoctorFilter';
import '../../styles/components.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minExperience: '',
    maxFee: '',
    search: '',
    page: 1,
    limit: 9,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await doctorService.getAllDoctors(filters);
      if (response.success) {
        setDoctors(response.data);
        setPagination({
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
        });
      }
    } catch (err) {
      setError('Failed to fetch doctors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="loader-container"><div className="loader">Loading doctors...</div></div>;
  }

  return (
    <div className="doctor-list-container">
      <div className="page-header">
        <h1>Find Your Doctor</h1>
        <p>Search and book appointments with qualified healthcare professionals</p>
      </div>

      <DoctorFilter onFilterChange={handleFilterChange} filters={filters} />

      {error && <div className="alert alert-error">{error}</div>}

      {doctors.length === 0 ? (
        <div className="no-results">
          <p>No doctors found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="doctor-grid">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorList;
