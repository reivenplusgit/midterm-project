import React, { useState, useMemo } from 'react';
import { spacesData } from '../../data/spaces';
import SearchBar from '../../components/SearchBar';
import SpaceCard from '../../components/SpaceCard';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSpaces = useMemo(() => {
    return spacesData.filter(space =>
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section text-center py-5">
          <h1 className="display-4">Find Your Perfect Study Spot</h1>
          <p className="lead">Discover the best co-working spaces and study hubs in the Philippines</p>
        </div>

        <div className="search-section mb-5">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        <div className="spaces-section">
          <h2 className="mb-4">Available Study Spaces</h2>
          <div className="row">
            {filteredSpaces.length > 0 ? (
              filteredSpaces.map(space => (
                <SpaceCard key={space.id} space={space} />
              ))
            ) : (
              <div className="col-12 text-center">
                <p>No study spaces found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;