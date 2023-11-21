using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;

namespace PlayniteWebExtension.UI
{
  public partial class MqttSettingsView : UserControl
  {
    public MqttSettingsView()
    {
      InitializeComponent();
    }

    private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
    {
      var regex = new Regex("[^0-9]+");
      e.Handled = regex.IsMatch(e.Text);
    }

    private void PasswordBox_OnPasswordChanged(object sender, RoutedEventArgs e)
    {
      var context = (MqttPluginSettingsViewModel)DataContext;
      context.SavePassword(PasswordBox.Password);
    }
  }
}
