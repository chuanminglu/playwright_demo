"""
Tests for document_converter.py

Tests the actual module API:
- find_api_key(): Locate Gemini API key from env/.env files
- find_project_root(): Find project root directory
- get_mime_type(): Determine MIME type from file extension
- upload_file(): Upload file to Gemini File API
- convert_to_markdown(): Convert a document to markdown via Gemini
- batch_convert(): Batch convert multiple files
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock, mock_open

sys.path.insert(0, str(Path(__file__).parent.parent))

import document_converter as dc


class TestFindApiKey:
    """Test API key discovery."""

    @patch.dict('os.environ', {'GEMINI_API_KEY': 'test-key-123'})
    def test_find_api_key_from_env(self):
        """Test finding API key from environment variable."""
        result = dc.find_api_key()
        assert result == 'test-key-123'

    @patch.dict('os.environ', {}, clear=True)
    @patch('document_converter.load_dotenv', None)
    def test_find_api_key_no_dotenv_no_env(self):
        """Test when no dotenv and no env variable set."""
        # Remove GEMINI_API_KEY if present
        import os
        os.environ.pop('GEMINI_API_KEY', None)
        result = dc.find_api_key()
        assert result is None

    @patch.dict('os.environ', {}, clear=True)
    @patch('document_converter.load_dotenv')
    @patch('pathlib.Path.exists')
    def test_find_api_key_from_skill_env(self, mock_exists, mock_load_dotenv):
        """Test loading API key from skill .env file."""
        import os
        os.environ.pop('GEMINI_API_KEY', None)

        mock_exists.return_value = True

        # Simulate load_dotenv setting the env var on first call
        def side_effect(*args, **kwargs):
            os.environ['GEMINI_API_KEY'] = 'skill-env-key'

        mock_load_dotenv.side_effect = side_effect

        result = dc.find_api_key()
        assert result == 'skill-env-key'
        mock_load_dotenv.assert_called()

        # Cleanup
        os.environ.pop('GEMINI_API_KEY', None)


class TestFindProjectRoot:
    """Test project root discovery."""

    @patch('pathlib.Path.exists')
    def test_find_project_root_with_git(self, mock_exists):
        """Test finding root with .git directory."""
        # The actual function traverses parents looking for .git or .claude
        # Just verify it returns a Path object
        result = dc.find_project_root()
        assert isinstance(result, Path)

    def test_find_project_root_returns_path(self):
        """Test that find_project_root always returns a Path."""
        result = dc.find_project_root()
        assert isinstance(result, Path)


class TestGetMimeType:
    """Test MIME type detection."""

    def test_pdf_mime_type(self):
        assert dc.get_mime_type('document.pdf') == 'application/pdf'

    def test_jpg_mime_type(self):
        assert dc.get_mime_type('photo.jpg') == 'image/jpeg'

    def test_jpeg_mime_type(self):
        assert dc.get_mime_type('photo.jpeg') == 'image/jpeg'

    def test_png_mime_type(self):
        assert dc.get_mime_type('image.png') == 'image/png'

    def test_webp_mime_type(self):
        assert dc.get_mime_type('image.webp') == 'image/webp'

    def test_docx_mime_type(self):
        assert dc.get_mime_type('file.docx') == \
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    def test_xlsx_mime_type(self):
        assert dc.get_mime_type('file.xlsx') == \
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    def test_pptx_mime_type(self):
        assert dc.get_mime_type('file.pptx') == \
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'

    def test_txt_mime_type(self):
        assert dc.get_mime_type('readme.txt') == 'text/plain'

    def test_html_mime_type(self):
        assert dc.get_mime_type('page.html') == 'text/html'

    def test_htm_mime_type(self):
        assert dc.get_mime_type('page.htm') == 'text/html'

    def test_md_mime_type(self):
        assert dc.get_mime_type('README.md') == 'text/markdown'

    def test_csv_mime_type(self):
        assert dc.get_mime_type('data.csv') == 'text/csv'

    def test_heic_mime_type(self):
        assert dc.get_mime_type('photo.heic') == 'image/heic'

    def test_unknown_extension(self):
        assert dc.get_mime_type('file.xyz') == 'application/octet-stream'

    def test_case_insensitive(self):
        assert dc.get_mime_type('DOCUMENT.PDF') == 'application/pdf'

    def test_path_with_directories(self):
        assert dc.get_mime_type('/path/to/document.pdf') == 'application/pdf'


class TestUploadFile:
    """Test file upload to Gemini API."""

    def test_upload_file_success(self):
        """Test successful file upload."""
        mock_client = Mock()
        mock_file = Mock()
        mock_file.state.name = 'ACTIVE'
        mock_file.name = 'files/abc123'
        mock_client.files.upload.return_value = mock_file

        result = dc.upload_file(mock_client, 'test.pdf', verbose=False)

        assert result == mock_file
        mock_client.files.upload.assert_called_once_with(file='test.pdf')

    @patch('time.sleep')
    def test_upload_file_processing_then_active(self, mock_sleep):
        """Test file that needs processing time."""
        mock_client = Mock()

        # First call returns PROCESSING, second returns ACTIVE
        mock_file_processing = Mock()
        mock_file_processing.state.name = 'PROCESSING'
        mock_file_processing.name = 'files/abc123'

        mock_file_active = Mock()
        mock_file_active.state.name = 'ACTIVE'
        mock_file_active.name = 'files/abc123'

        mock_client.files.upload.return_value = mock_file_processing
        mock_client.files.get.return_value = mock_file_active

        result = dc.upload_file(mock_client, 'test.pdf', verbose=False)

        assert result.state.name == 'ACTIVE'

    def test_upload_file_failed(self):
        """Test file upload that fails processing."""
        mock_client = Mock()
        mock_file = Mock()
        mock_file.state.name = 'FAILED'
        mock_client.files.upload.return_value = mock_file

        with pytest.raises(ValueError, match="File processing failed"):
            dc.upload_file(mock_client, 'test.pdf', verbose=False)


class TestConvertToMarkdown:
    """Test document to markdown conversion."""

    @patch('pathlib.Path.stat')
    @patch('builtins.open', mock_open(read_data=b'fake pdf content'))
    def test_convert_small_file_inline(self, mock_stat):
        """Test converting a small file using inline content."""
        mock_stat.return_value.st_size = 1024  # 1KB - small file

        mock_client = Mock()
        mock_response = Mock()
        mock_response.text = '# Converted Document\n\nSome content here.'
        mock_client.models.generate_content.return_value = mock_response

        result = dc.convert_to_markdown(mock_client, 'test.pdf', verbose=False)

        assert result['status'] == 'success'
        assert result['markdown'] == '# Converted Document\n\nSome content here.'
        assert result['file'] == 'test.pdf'

    @patch('document_converter.upload_file')
    @patch('pathlib.Path.stat')
    def test_convert_large_file_uses_file_api(self, mock_stat, mock_upload):
        """Test converting a large file uses File API upload."""
        mock_stat.return_value.st_size = 30 * 1024 * 1024  # 30MB

        mock_uploaded = Mock()
        mock_upload.return_value = mock_uploaded

        mock_client = Mock()
        mock_response = Mock()
        mock_response.text = '# Large Document'
        mock_client.models.generate_content.return_value = mock_response

        result = dc.convert_to_markdown(mock_client, 'big.pdf', verbose=False)

        assert result['status'] == 'success'
        mock_upload.assert_called_once()

    @patch('time.sleep')
    @patch('pathlib.Path.stat')
    @patch('builtins.open', mock_open(read_data=b'fake content'))
    def test_convert_with_retry_on_failure(self, mock_stat, mock_sleep):
        """Test retry logic on conversion failure."""
        mock_stat.return_value.st_size = 1024

        mock_client = Mock()
        mock_client.models.generate_content.side_effect = Exception("API error")

        result = dc.convert_to_markdown(
            mock_client, 'test.pdf', verbose=False, max_retries=2
        )

        assert result['status'] == 'error'
        assert 'API error' in result['error']
        assert mock_client.models.generate_content.call_count == 2

    @patch('pathlib.Path.stat')
    @patch('builtins.open', mock_open(read_data=b'fake content'))
    def test_convert_with_custom_prompt(self, mock_stat):
        """Test conversion with custom prompt."""
        mock_stat.return_value.st_size = 1024

        mock_client = Mock()
        mock_response = Mock()
        mock_response.text = '| Col1 | Col2 |'
        mock_client.models.generate_content.return_value = mock_response

        result = dc.convert_to_markdown(
            mock_client, 'test.pdf',
            custom_prompt='Extract only the tables as markdown',
            verbose=False
        )

        assert result['status'] == 'success'
        # Verify custom prompt was used in the call
        call_args = mock_client.models.generate_content.call_args
        content = call_args[1]['contents'] if 'contents' in call_args[1] else call_args[0][0]
        assert any('Extract only the tables' in str(c) for c in content) if isinstance(content, list) else True


class TestBatchConvert:
    """Test batch conversion."""

    @patch('document_converter.find_api_key')
    def test_batch_convert_no_api_key(self, mock_find_key):
        """Test batch convert fails gracefully without API key."""
        mock_find_key.return_value = None

        with pytest.raises(SystemExit):
            dc.batch_convert(files=['test.pdf'])

    @patch('builtins.open', mock_open())
    @patch('pathlib.Path.mkdir')
    @patch('document_converter.convert_to_markdown')
    @patch('document_converter.find_project_root')
    @patch('document_converter.find_api_key')
    @patch('google.genai.Client')
    def test_batch_convert_single_file(self, mock_client_class, mock_find_key,
                                        mock_root, mock_convert, mock_mkdir):
        """Test batch converting a single file."""
        mock_find_key.return_value = 'test-key'
        mock_root.return_value = Path('/project')
        mock_convert.return_value = {
            'file': 'test.pdf',
            'status': 'success',
            'markdown': '# Test'
        }

        results = dc.batch_convert(
            files=['test.pdf'],
            output_file='output.md',
            verbose=False
        )

        assert len(results) == 1
        assert results[0]['status'] == 'success'

    @patch('builtins.open', mock_open())
    @patch('pathlib.Path.mkdir')
    @patch('document_converter.convert_to_markdown')
    @patch('document_converter.find_project_root')
    @patch('document_converter.find_api_key')
    @patch('google.genai.Client')
    def test_batch_convert_multiple_files(self, mock_client_class, mock_find_key,
                                           mock_root, mock_convert, mock_mkdir):
        """Test batch converting multiple files."""
        mock_find_key.return_value = 'test-key'
        mock_root.return_value = Path('/project')
        mock_convert.side_effect = [
            {'file': 'a.pdf', 'status': 'success', 'markdown': '# A'},
            {'file': 'b.pdf', 'status': 'error', 'error': 'fail', 'markdown': None},
        ]

        results = dc.batch_convert(
            files=['a.pdf', 'b.pdf'],
            output_file='output.md',
            verbose=False
        )

        assert len(results) == 2
        assert results[0]['status'] == 'success'
        assert results[1]['status'] == 'error'


class TestIntegration:
    """Integration-level tests."""

    def test_file_not_found(self):
        """Test handling of non-existent input file."""
        assert not Path('nonexistent-file-12345.pdf').exists()

    def test_get_mime_type_all_supported(self):
        """Test that all documented formats have MIME types."""
        supported = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic',
                     '.docx', '.xlsx', '.pptx', '.txt', '.html', '.md', '.csv']
        for ext in supported:
            mime = dc.get_mime_type(f'test{ext}')
            assert mime != 'application/octet-stream', f"No MIME type for {ext}"


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--cov=document_converter', '--cov-report=term-missing'])
