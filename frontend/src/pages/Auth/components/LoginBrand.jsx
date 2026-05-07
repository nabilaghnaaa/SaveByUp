function IconLeaf() {
  return (
    <svg viewBox="0 0 24 24" className="login-brand-icon">
      <path d="M19 5c-7.2.3-12 3.9-12 9.4 0 2.7 1.9 4.6 4.5 4.6C16.9 19 19 12.6 19 5z" />
      <path d="M7 19c2.4-4.6 5.5-7.3 9.2-9" />
    </svg>
  );
}

function LoginBrand() {
  return (
    <div className="login-brand">
      <div className="login-logo">
        <IconLeaf />
      </div>

      <div>
        <span>SaveByUp</span>
        <strong>Food Waste Prevention System</strong>
      </div>
    </div>
  );
}

export default LoginBrand;