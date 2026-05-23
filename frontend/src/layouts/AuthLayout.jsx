import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-12 text-white lg:px-12 lg:py-16">
          <div className="mx-auto w-full max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
              Team Task Manager
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              Organize projects and tasks with your team
            </h1>
            <p className="mt-4 text-base leading-relaxed text-indigo-100">
              Track progress, assign work, and stay on top of deadlines from one simple
              dashboard.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-indigo-100">
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                Secure login with JWT authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                Role-based access for admins and members
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                Projects, tasks, and dashboard insights
              </li>
            </ul>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
