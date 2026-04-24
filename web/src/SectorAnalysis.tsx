import React, { useState, useRef } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { CheckCircle, ExpandMore, UploadFile } from '@mui/icons-material';

interface LapData {
  lap_number: number;
  sector_boundaries_m: number[];
}

interface SectorAnalysisResult {
  num_laps: number;
  num_sectors: number;
  laps: LapData[];
  average_sector_boundaries_m: number[];
}

const SectorAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SectorAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      if (!file.name.toLowerCase().endsWith('.ld')) {
        setError('File must have a .ld extension');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      setResults(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch('https://dev.arib.dev/enduro/v1/analyze-sectors', {
        method: 'POST',
        body: formData,
        // No Content-Type header — browser sets multipart boundary automatically
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else if (response.status === 400) {
        const errData = await response.json();
        setError(errData.error || 'Invalid file or processing error.');
      } else {
        setError('Server error. Please try again.');
      }
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '20px' }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        MoTeC Sector Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '30px' }}>
        Upload an iRacing MoTeC telemetry file (.ld) from a full stint to generate sector boundary
        distances. This lets you align your MoTeC sections with iRacing's sectors so your in-session
        and post-analysis data match.
      </Typography>

      {/* Upload section */}
      <Paper
        variant="outlined"
        sx={{
          padding: '30px',
          marginBottom: '30px',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: selectedFile ? 'primary.main' : 'divider',
          backgroundColor: selectedFile ? 'action.hover' : 'background.paper',
          textAlign: 'center',
        }}
      >
        <input
          type="file"
          accept=".ld"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <UploadFile sx={{ fontSize: 48, color: 'text.secondary', marginBottom: '12px' }} />

        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: '16px' }}>
          Select an iRacing MoTeC <strong>.ld</strong> file recorded from a complete stint.
          The file must contain Beacon and Lap Distance channels.
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => fileInputRef.current?.click()}
          sx={{ marginBottom: selectedFile ? '16px' : 0 }}
        >
          Choose .ld File
        </Button>

        {selectedFile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              marginTop: '8px',
            }}
          >
            <CheckCircle color="primary" fontSize="small" />
            <Typography variant="body2" color="primary">
              {selectedFile.name}
            </Typography>
          </Box>
        )}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        disabled={!selectedFile || isLoading}
        onClick={handleAnalyze}
        sx={{ marginBottom: '30px' }}
      >
        Analyze
      </Button>

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: '20px' }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Processing telemetry file...
          </Typography>
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      )}

      {/* Results section */}
      {results && (
        <Box>
          {/* Summary card */}
          <Paper sx={{ padding: '24px', marginBottom: '24px' }}>
            <Typography variant="h5" gutterBottom>
              Average Sector Boundaries
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, marginBottom: '20px' }}>
              <Chip label={`${results.num_laps} laps`} color="primary" variant="outlined" />
              <Chip
                label={`${results.num_sectors} sectors`}
                color="primary"
                variant="outlined"
              />
            </Box>

            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Sector
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Distance from Start (m)
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Gap from Previous (m)
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.average_sector_boundaries_m.map((boundary, index) => {
                    const prev =
                      index === 0 ? 0 : results.average_sector_boundaries_m[index - 1];
                    const gap = boundary - prev;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="h6">S{index + 1}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6">{boundary.toFixed(1)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" color="text.secondary">
                            {gap.toFixed(1)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Per-lap breakdown */}
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">Per-Lap Breakdown</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Lap #</strong>
                      </TableCell>
                      {Array.from({ length: results.num_sectors }, (_, i) => (
                        <TableCell key={i}>
                          <strong>Sector {i + 1} (m)</strong>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.laps.map((lap) => (
                      <TableRow key={lap.lap_number}>
                        <TableCell>{lap.lap_number}</TableCell>
                        {lap.sector_boundaries_m.map((boundary, sIdx) => (
                          <TableCell key={sIdx}>{boundary.toFixed(1)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
};

export default SectorAnalysis;
