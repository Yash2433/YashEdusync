import React from 'react';
import { Box, Container, Typography, Grid, IconButton, Link, styled } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Mail, Phone } from '@mui/icons-material';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  padding: '4rem 0 2rem',
  marginTop: 'auto',
}));

const FooterSection = styled(Box)({
  textAlign: 'center',
  marginBottom: '2rem',
});

const SocialIcon = styled(IconButton)({
  color: '#fff',
  '&:hover': {
    color: '#ffd700',
  },
  marginRight: '1rem',
});

const ContactInfo = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  marginTop: '2rem',
});

const ContactItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

const Footer = ({ footerRef }) => {
  return (
    <FooterContainer ref={footerRef} id="footer">
      <Container maxWidth="lg">
        <FooterSection>
          <Typography variant="h4" component="h2" gutterBottom>
            EduSync LMS
          </Typography>
          <Typography variant="body1" paragraph>
            Empowering education through technology. Your one-stop solution for modern learning management.
          </Typography>
          
          <Box sx={{ marginBottom: '2rem' }}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <SocialIcon href="#" target="_blank">
                <Facebook />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <Twitter />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <Instagram />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <LinkedIn />
              </SocialIcon>
            </Box>
          </Box>

          <ContactInfo>
            <ContactItem>
              <Phone />
              <Typography variant="body1">
                +1 (555) 123-4567
              </Typography>
            </ContactItem>
            <ContactItem>
              <Mail />
              <Typography variant="body1">
                info@edusynclms.com
              </Typography>
            </ContactItem>
          </ContactInfo>

          <Typography variant="body2" sx={{ marginTop: '2rem' }}>
            © {new Date().getFullYear()} EduSync LMS. All rights reserved.
          </Typography>
        </FooterSection>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
