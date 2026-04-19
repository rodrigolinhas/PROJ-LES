import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App';
import './styles/tailwind.css'
import './styles/index.css'

/*
// Since there are no other components, we define a simple App here
// You can move this to src/app/App.tsx later
function App() {
    return (
        <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4', padding: '2rem' }}>
            <h1>Setup Complete</h1>
            <p>Edit <code>src/main.tsx</code> to start building your app.</p>
        </div>
    )
}
*/

const root = document.getElementById('root')

if (!root) {
    throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
