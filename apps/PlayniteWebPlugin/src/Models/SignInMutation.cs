namespace PlayniteWeb.Models
{

  internal class SignIn
  {
    public string Credential { get; set; }
  }
  internal class SignInMutation
  {
    public SignIn SignIn {  get; set; }
  }
}
