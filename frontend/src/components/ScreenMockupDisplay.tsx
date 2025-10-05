interface ScreenMockupDisplayProps {
  mockupUrl?: string;
  title?: string;
  className?: string;
  colorTheme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    border?: string;
  };
}

const ScreenMockupDisplay = ({
  mockupUrl,
  title = "Website Mockup",
  className = '',
  colorTheme = {
    primary: '#7C3AED',
    secondary: '#DB2777',
    accent: '#EA580C',
    background: 'rgba(255, 255, 255, 0.05)',
    text: '#1F2937',
    border: 'rgba(255, 255, 255, 0.3)',
  }
}: ScreenMockupDisplayProps) => {
  
  // Generate different mockup content based on title
  const getMockupContent = () => {
    const baseStyles = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: #333;
      }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .header { 
        background: rgba(255,255,255,0.95); 
        padding: 20px; 
        border-radius: 12px; 
        margin-bottom: 30px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
      }
      .nav { display: flex; justify-content: space-between; align-items: center; }
      .logo { font-size: 24px; font-weight: bold; color: #7C3AED; }
      .nav-links { display: flex; gap: 30px; list-style: none; }
      .nav-links a { text-decoration: none; color: #555; font-weight: 500; }
      .card { 
        background: rgba(255,255,255,0.95); 
        padding: 30px; 
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
      .btn { 
        background: linear-gradient(45deg, #7C3AED, #DB2777);
        color: white; 
        padding: 12px 24px; 
        border: none; 
        border-radius: 8px; 
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .btn:hover { transform: translateY(-2px); }
    `;

    if (title.toLowerCase().includes('home')) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Home Page</title>
            <style>${baseStyles}
              .hero { 
                text-align: center; 
                padding: 80px 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 16px;
                backdrop-filter: blur(20px);
                margin-bottom: 40px;
              }
              .hero h1 { font-size: 52px; margin-bottom: 20px; color: white; }
              .hero p { font-size: 22px; color: rgba(255,255,255,0.9); margin-bottom: 40px; }
              .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
              .feature-card h3 { color: #7C3AED; margin-bottom: 15px; font-size: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <header class="header">
                    <nav class="nav">
                        <div class="logo">🏠 YourApp Home</div>
                        <ul class="nav-links">
                            <li><a href="#home">Home</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </nav>
                </header>
                
                <main>
                    <section class="hero">
                        <h1>Welcome to Your App</h1>
                        <p>Transform your workflow with our innovative solution</p>
                        <button class="btn">Get Started Free</button>
                        <button class="btn" style="margin-left: 15px; background: rgba(255,255,255,0.2);">Watch Demo</button>
                    </section>
                    
                    <section class="features">
                        <div class="card">
                            <h3>🚀 Lightning Fast</h3>
                            <p>Experience blazing-fast performance with our optimized infrastructure and cutting-edge technology stack.</p>
                        </div>
                        <div class="card">
                            <h3>🎨 Beautiful Design</h3>
                            <p>Stunning user interface designed with modern principles and user experience best practices.</p>
                        </div>
                        <div class="card">
                            <h3>🔒 Enterprise Security</h3>
                            <p>Bank-level security to protect your data with end-to-end encryption and compliance standards.</p>
                        </div>
                    </section>
                </main>
            </div>
        </body>
        </html>
      `;
    } else if (title.toLowerCase().includes('dashboard')) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Dashboard</title>
            <style>${baseStyles}
              .sidebar { 
                position: fixed; 
                left: 0; 
                top: 0; 
                width: 250px; 
                height: 100vh; 
                background: rgba(255,255,255,0.95);
                padding: 20px;
                backdrop-filter: blur(10px);
              }
              .main-content { margin-left: 270px; padding: 20px; }
              .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
              .stat-card { background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; text-align: center; }
              .stat-number { font-size: 32px; font-weight: bold; color: #7C3AED; }
              .chart-container { background: rgba(255,255,255,0.95); padding: 30px; border-radius: 12px; height: 300px; }
              .sidebar-item { padding: 12px; margin: 8px 0; border-radius: 8px; cursor: pointer; }
              .sidebar-item:hover { background: rgba(124,58,237,0.1); }
              .sidebar-item.active { background: linear-gradient(45deg, #7C3AED, #DB2777); color: white; }
            </style>
        </head>
        <body>
            <div class="sidebar">
                <div class="logo" style="margin-bottom: 30px;">📊 Dashboard</div>
                <div class="sidebar-item active">🏠 Overview</div>
                <div class="sidebar-item">📈 Analytics</div>
                <div class="sidebar-item">👥 Users</div>
                <div class="sidebar-item">💰 Revenue</div>
                <div class="sidebar-item">⚙️ Settings</div>
                <div class="sidebar-item">📞 Support</div>
            </div>
            
            <div class="main-content">
                <h1 style="color: white; margin-bottom: 30px;">Welcome back, Admin!</h1>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">12,847</div>
                        <div>Total Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">$24,596</div>
                        <div>Revenue</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">98.5%</div>
                        <div>Uptime</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">1,429</div>
                        <div>Active Sessions</div>
                    </div>
                </div>
                
                <div class="grid">
                    <div class="chart-container">
                        <h3 style="margin-bottom: 20px;">📈 Revenue Trends</h3>
                        <div style="height: 200px; background: linear-gradient(45deg, #7C3AED20, #DB277720); border-radius: 8px; display: flex; align-items: end; justify-content: space-around; padding: 20px;">
                            <div style="width: 40px; height: 60%; background: #7C3AED; border-radius: 4px;"></div>
                            <div style="width: 40px; height: 80%; background: #DB2777; border-radius: 4px;"></div>
                            <div style="width: 40px; height: 45%; background: #EA580C; border-radius: 4px;"></div>
                            <div style="width: 40px; height: 90%; background: #7C3AED; border-radius: 4px;"></div>
                            <div style="width: 40px; height: 70%; background: #DB2777; border-radius: 4px;"></div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h3 style="margin-bottom: 20px;">👥 User Activity</h3>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; height: 200px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Active Users</span>
                                <span style="color: #7C3AED; font-weight: bold;">+12.5%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>New Signups</span>
                                <span style="color: #DB2777; font-weight: bold;">+8.2%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Bounce Rate</span>
                                <span style="color: #EA580C; font-weight: bold;">-3.1%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;
    } else if (title.toLowerCase().includes('profile')) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Profile</title>
            <style>${baseStyles}
              .profile-header { 
                background: rgba(255,255,255,0.1); 
                padding: 40px; 
                border-radius: 16px; 
                text-align: center; 
                margin-bottom: 30px;
                backdrop-filter: blur(20px);
              }
              .avatar { 
                width: 120px; 
                height: 120px; 
                border-radius: 50%; 
                background: linear-gradient(45deg, #7C3AED, #DB2777);
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
              }
              .profile-content { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
              .form-group { margin-bottom: 20px; }
              .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
              .form-group input { 
                width: 100%; 
                padding: 12px; 
                border: 2px solid rgba(255,255,255,0.3); 
                border-radius: 8px;
                background: rgba(255,255,255,0.1);
                color: #333;
              }
              .settings-section { margin-bottom: 30px; }
              .toggle { 
                width: 50px; 
                height: 25px; 
                background: #7C3AED; 
                border-radius: 25px; 
                position: relative;
                cursor: pointer;
              }
              .toggle::after { 
                content: ''; 
                width: 20px; 
                height: 20px; 
                background: white; 
                border-radius: 50%; 
                position: absolute; 
                top: 2.5px; 
                right: 2.5px;
              }
            </style>
        </head>
        <body>
            <div class="container">
                <header class="header">
                    <nav class="nav">
                        <div class="logo">👤 User Profile</div>
                        <ul class="nav-links">
                            <li><a href="#dashboard">Dashboard</a></li>
                            <li><a href="#settings">Settings</a></li>
                            <li><a href="#help">Help</a></li>
                            <li><a href="#logout">Logout</a></li>
                        </ul>
                    </nav>
                </header>
                
                <div class="profile-header">
                    <div class="avatar">👤</div>
                    <h1 style="color: white; margin-bottom: 10px;">John Doe</h1>
                    <p style="color: rgba(255,255,255,0.8);">Software Developer • Premium Member</p>
                    <button class="btn" style="margin-top: 20px;">Edit Profile</button>
                </div>
                
                <div class="profile-content">
                    <div class="card">
                        <h3 style="margin-bottom: 20px; color: #7C3AED;">Personal Information</h3>
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" value="John Doe" />
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="john.doe@example.com" />
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" value="+1 (555) 123-4567" />
                        </div>
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" value="San Francisco, CA" />
                        </div>
                        <button class="btn">Save Changes</button>
                    </div>
                    
                    <div>
                        <div class="card settings-section">
                            <h3 style="margin-bottom: 20px; color: #7C3AED;">Account Settings</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <span>Email Notifications</span>
                                <div class="toggle"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <span>SMS Alerts</span>
                                <div class="toggle"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <span>Two-Factor Auth</span>
                                <div class="toggle"></div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3 style="margin-bottom: 20px; color: #7C3AED;">Activity Summary</h3>
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Projects Completed</span>
                                    <strong>24</strong>
                                </div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Hours Logged</span>
                                    <strong>156.5</strong>
                                </div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Team Rating</span>
                                    <strong>4.8/5.0</strong>
                                </div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Member Since</span>
                                    <strong>Jan 2023</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;
    }

    // Default fallback mockup
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Website Mockup</title>
          <style>${baseStyles}
            .hero { 
              text-align: center; 
              padding: 60px 20px;
              background: rgba(255,255,255,0.1);
              border-radius: 16px;
              backdrop-filter: blur(20px);
              margin-bottom: 40px;
            }
            .hero h1 { font-size: 48px; margin-bottom: 20px; color: white; }
            .hero p { font-size: 20px; color: rgba(255,255,255,0.9); margin-bottom: 30px; }
          </style>
      </head>
      <body>
          <div class="container">
              <header class="header">
                  <nav class="nav">
                      <div class="logo">Your App</div>
                      <ul class="nav-links">
                          <li><a href="#home">Home</a></li>
                          <li><a href="#features">Features</a></li>
                          <li><a href="#about">About</a></li>
                          <li><a href="#contact">Contact</a></li>
                      </ul>
                  </nav>
              </header>
              
              <main>
                  <section class="hero">
                      <h1>Welcome to Your App</h1>
                      <p>This is a mockup of what your application might look like</p>
                      <button class="btn">Get Started</button>
                  </section>
                  
                  <div class="grid">
                      <div class="card">
                          <h3>🚀 Fast Performance</h3>
                          <p>Lightning-fast load times and smooth user experience.</p>
                      </div>
                      <div class="card">
                          <h3>🎨 Beautiful Design</h3>
                          <p>Modern, clean interface that users love.</p>
                      </div>
                      <div class="card">
                          <h3>🔒 Secure</h3>
                          <p>Enterprise-grade security to keep your data safe.</p>
                      </div>
                  </div>
              </main>
          </div>
      </body>
      </html>
    `;
  };

  const defaultMockupContent = getMockupContent();

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h3 
          className="text-lg font-semibold flex items-center gap-2"
          style={{ color: colorTheme.text }}
        >
          <span className="text-xl">🖥️</span>
          {title}
        </h3>
      </div>
      
      <div 
        className="relative w-full border-2 rounded-lg overflow-hidden shadow-lg"
        style={{ 
          borderColor: colorTheme.border,
          backgroundColor: colorTheme.background 
        }}
      >
        {/* Browser mockup header */}
        <div 
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ 
            backgroundColor: `${colorTheme.primary}20`,
            borderColor: colorTheme.border 
          }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div 
            className="flex-1 mx-4 px-3 py-1 rounded text-xs"
            style={{ 
              backgroundColor: colorTheme.background,
              color: colorTheme.text 
            }}
          >
            {mockupUrl || 'https://your-app.com'}
          </div>
        </div>
        
        {/* Website content iframe */}
        <div className="w-full" style={{ height: '500px' }}>
          {mockupUrl ? (
            <iframe
              src={mockupUrl}
              className="w-full h-full border-0"
              title={title}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <iframe
              srcDoc={defaultMockupContent}
              className="w-full h-full border-0"
              title={title}
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>
      
      {/* Mockup info */}
      <div className="mt-3 text-sm" style={{ color: `${colorTheme.text}80` }}>
        <p>
          {mockupUrl 
            ? 'Interactive website mockup preview' 
            : 'Default mockup template - actual design will be generated based on your requirements'
          }
        </p>
      </div>
    </div>
  );
};

export default ScreenMockupDisplay;
export type { ScreenMockupDisplayProps };