import sys,unittest,urllib.error
from unittest.mock import patch
import daily_links as audit
class Response:
 status=200
 class Headers:
  def get_content_charset(self):return 'utf-8'
 headers=Headers()
 def __init__(self,text):self.text=text
 def __enter__(self):return self
 def __exit__(self,*a):pass
 def read(self,*a):return self.text.encode()
class AuditTests(unittest.TestCase):
 def probe(self,text):
  with patch('urllib.request.urlopen',return_value=Response(text)):
   return audit.probe('https://example.org/jobs/123','Modélisation thermique de batteries lithium-ion')
 def test_expired_beats_apply_navigation(self):self.assertEqual(self.probe('<h1>Cette offre n’est plus disponible</h1><a>Je postule</a>')[1],'closed')
 def test_generic_apply_is_not_specific_offer(self):self.assertEqual(self.probe('<h1>Nos carrières</h1><a>Apply now</a>')[1],'uncertain')
 def test_specific_description_and_application_action(self):self.assertEqual(self.probe('<h1>Modélisation thermique de batteries lithium-ion</h1><a>Je postule</a>')[1],'listing_visible')
 def test_access_block_is_not_closed(self):
  with patch('urllib.request.urlopen',side_effect=urllib.error.HTTPError('u',403,'Forbidden',{},None)):
   self.assertEqual(audit.probe('https://example.org/jobs/123')[1],'blocked')
if __name__=='__main__':unittest.main()
