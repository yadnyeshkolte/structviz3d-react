import React from 'react';

const ViewControls = ({ onViewChange }) => {
    const views = [
        { name: 'Front', icon: '⬆', view: 'front' },
        { name: 'Back', icon: '⬇', view: 'back' },
        { name: 'Left', icon: '⬅', view: 'left' },
        { name: 'Right', icon: '➡', view: 'right' },
        { name: 'Top', icon: '⊥', view: 'top' },
        { name: 'Bottom', icon: '⊤', view: 'bottom' },
        { name: 'Isometric', icon: '⬣', view: 'isometric' }
    ];

    return (
        <div className="view-controls" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px'
        }}>
            <div style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
            }}>
                Camera Views
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px'
            }}>
                {views.map((view) => (
                    <button
                        key={view.view}
                        onClick={() => onViewChange(view.view)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            padding: '8px 4px',
                            transition: 'background-color 0.2s ease',
                            width: '100%',
                            fontSize: '12px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                        title={`Switch to ${view.name} view`}
                    >
                        <span style={{ fontSize: '14px', marginRight: '4px' }}>{view.icon}</span>
                        {view.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ViewControls;