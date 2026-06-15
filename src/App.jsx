import { useState, useEffect } from 'react';
import { texts } from './data';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedText, setSelectedText] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle setting background image
  useEffect(() => {
    if (currentView === 'dashboard') {
      document.body.style.setProperty('--bg-image', 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba)');
    } else if (selectedText) {
      document.body.style.setProperty('--bg-image', selectedText.bgImage || 'url(https://images.unsplash.com/photo-1537255263864-b779ce1854ff)');
    }
  }, [currentView, selectedText]);

  const handleTextClick = (text) => {
    setSelectedText(text);
    setCurrentView('text');
    window.scrollTo(0, 0);
  };

  const filteredTexts = texts.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <a className="skip-link" href="#" onClick={(e) => {
        if (currentView === 'text') {
           e.preventDefault();
           setCurrentView('dashboard');
           setSelectedText(null);
        }
      }}>
        {currentView === 'dashboard' ? 'Top of Dashboard' : 'Back to Dashboard'}
      </a>
      <a className="skip-link" href="#footer">More Resources</a>
      
      <main>
        {currentView === 'dashboard' ? (
          <div className="dashboard">
            <article>
              <h1>Multiverse</h1>
              <h2>Explore poetry, song lyrics, and essays.</h2>
              
              <div className="search-container">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="Search by title, author, or type..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="text-list">
                {filteredTexts.map(text => (
                  <div key={text.id} className="text-card" onClick={() => handleTextClick(text)}>
                    <h2>{text.title}</h2>
                    <p>By {text.author} • {text.type}</p>
                  </div>
                ))}
                {filteredTexts.length === 0 && <p>No texts found matching your search.</p>}
              </div>
            </article>
          </div>
        ) : (
          <article>
            <h1>{selectedText.title}</h1>
            <h2>{selectedText.subtitle || `By ${selectedText.author}`}</h2>
            <div dangerouslySetInnerHTML={{ __html: selectedText.content }} />
          </article>
        )}

        <footer className="page-footer" id="footer">
          <h3>More Resources</h3>
          <section>
            <h4>Categories</h4>
            <ul>
              <li><a href="#" onClick={(e) => {e.preventDefault(); setCurrentView('dashboard'); setSearchQuery('poetry');}}>Poetry</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); setCurrentView('dashboard'); setSearchQuery('essay');}}>Essays</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); setCurrentView('dashboard'); setSearchQuery('song lyrics');}}>Song Lyrics</a></li>
            </ul>
          </section>
          <section>
            <h4>Authors</h4>
            <ul>
              <li><a href="#" onClick={(e) => {e.preventDefault(); setCurrentView('dashboard'); setSearchQuery('Jane Doe');}}>Jane Doe</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); setCurrentView('dashboard'); setSearchQuery('John Smith');}}>John Smith</a></li>
              <li><a href="#" onClick={(e) => {e.preventDefault(); setCurrentView('dashboard'); setSearchQuery('Unknown');}}>Unknown</a></li>
            </ul>
          </section>
          <section>
            <h4>About Multiverse</h4>
            <ul>
              <li><a href="#">Submit a Piece</a></li>
              <li><a href="#">Community Guidelines</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </section>
        </footer>
      </main>
    </>
  );
}

export default App;
