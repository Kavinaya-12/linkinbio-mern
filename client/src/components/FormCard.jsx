const FormCard = ({ title, subtitle, children, footer }) => (
  <div className="auth-page">
    <div className="auth-card">
      <h2>{title}</h2>
      {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
      {children}
      {footer ? <div className="auth-footer">{footer}</div> : null}
    </div>
  </div>
);

export default FormCard;