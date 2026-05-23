const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      {children}

      {footer && <div className="mt-6 border-t border-slate-100 pt-6">{footer}</div>}
    </div>
  );
};

export default AuthCard;
