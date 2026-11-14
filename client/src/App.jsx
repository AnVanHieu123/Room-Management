import Banner from './components/Banner';
import Footer from './components/Footer';
import Header from './components/Header';
import HomePage from './components/HomePage';

function App() {
    return (
        <div className="min-h-screen w-full bg-[url('./assets/images/bgr.jpg')] bg-cover bg-center bg-no-repeat bg-fixed">
            <header>
                <Header />
            </header>
            <main className="w-[70%] mx-auto">
                <Banner />
                <HomePage />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default App;
