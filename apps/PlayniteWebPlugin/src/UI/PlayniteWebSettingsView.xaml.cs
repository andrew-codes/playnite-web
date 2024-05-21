using PlayniteWeb.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace PlayniteWeb
{
    public partial class PlayniteWebSettingsView : UserControl
    {
        public PlayniteWebSettingsView()
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
      var context = (UI.PlayniteWebSettingsViewModel)DataContext;
      context.SavePassword(PasswordBox.Password);
    }
  }
}
